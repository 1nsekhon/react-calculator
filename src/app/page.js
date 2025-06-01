"use client";
import styles from "./page.css";
import { useReducer, useEffect } from "react";
import DigitButton from "@/DigitButton";
import OperationButton from "@/OperationButton";

export const ACTIONS = {
  ADD_DIGIT: 'add digit',
  CHOOSE_OPERATION: 'choose-operation',
  CLEAR: 'clear',
  DELETE_DIGIT: 'delete_digit',
  EVALUATE: 'evaluate',
}

function evaluate ({currentOperand, previousOperand, operation }) {
  const prev = parseFloat(previousOperand);
  const curr = parseFloat(currentOperand);

  if (isNaN(prev) || isNaN(curr))
  {
    return ""
  }

  let output = ""

  switch(operation) {
    case "+":
      output = prev + curr;
      break;
    case "-":
      output = prev - curr;
      break;
    case "*":
      output = prev * curr;
      break;
    case "÷":
      output = prev / curr;
      break;
  }

  return output.toString();
}

const INTEGER_FORMATTER = Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0
})

function formatOperand (operand) {
  if (operand == null) return
    const [integer, decimal] = operand.split(".");
    if (decimal == null) return INTEGER_FORMATTER.format(integer);
    return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
  }

function reducer(state, {type, payload}) {
  switch(type) {
    case ACTIONS.ADD_DIGIT:
      if (state.overwrite == true) 
        return {
          ...state,
          overwrite: false,
          currentOperand: payload.digit,
        }
      if (payload.digit === "0" && state.currentOperand === "0") 
        return state
      if (payload.digit === "." && state.currentOperand.includes(".")) 
        return state
      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`
      }
    
    case ACTIONS.CLEAR:
      return {}
    
    case ACTIONS.CHOOSE_OPERATION:
      // if there are no numbers
      if (state.currentOperand == null && state.previousOperand == null )
        return state

      // if the user put the first operand but not yet the second
      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null
        }
      }

      // if the user did not put anything for the first operand
      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation
        }
      }

      // default
      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null
      }
    case ACTIONS.EVALUATE:
      if (state.operation == null || state.currentOperand == null && state.previousOperand == null)
      {
        return state
      }

      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        currentOperand: evaluate(state),
        operation: null
      }

    case ACTIONS.DELETE_DIGIT:
      if (state.currentOperand == null)
        return state
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: null, 
          overwrite: false
        }
      }
      /* can't delete symbols */
      if (state.currentOperand.length === 1) {
        return {
          ...state,
          currentOperand: null
        }
      }
      
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0,-1)
      }


  }
}

export default function App() {
  console.log("App component rendered");
  const [{currentOperand, previousOperand, operation }, dispatch] = useReducer(reducer, {});
  
  useEffect(()=> {
    const handleKeyDown = (event) => {
      const key = event.key;
      console.log("useEffect is running");
      console.log(key);

      // if the user types a digit
      if (/^[0-9]$/.test(key))
      {
        dispatch({ type: ACTIONS.ADD_DIGIT, payload : {digit: key} })
      }

      else if (/^[+\-*/]$/.test(key))
      {
        dispatch({ type: ACTIONS.CHOOSE_OPERATION, payload : {operation: key} });
      }

      else if (key === "Enter")
      {
        dispatch({type: ACTIONS.EVALUATE});
      }

      else if (key === "Backspace")
      {
        dispatch({type: ACTIONS.DELETE_DIGIT})
      }

      else if (key === "Escape")
      {
        dispatch({type: ACTIONS.CLEAR})
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    }
  }, []);


  return (
    <div className="calculator-grid">
      <div className="output">
        <div className="previous-operand">{formatOperand(previousOperand)} {operation}</div>
        <div className="current-operand">{formatOperand(currentOperand)}</div>
      </div>
      <button className="two-column" onClick={() => dispatch({type: ACTIONS.CLEAR})}>CLEAR</button>
      <button onClick={() => dispatch({type: ACTIONS.DELETE_DIGIT})}>DEL</button>
      <OperationButton operation="÷" dispatch={dispatch}/>
      <DigitButton digit="1" dispatch={dispatch}/>
      <DigitButton digit="2" dispatch={dispatch}/>
      <DigitButton digit="3" dispatch={dispatch}/>
      <OperationButton operation="*" dispatch={dispatch}/>
      <DigitButton digit="4" dispatch={dispatch}/>
      <DigitButton digit="5" dispatch={dispatch}/>
      <DigitButton digit="6" dispatch={dispatch}/>
      <OperationButton operation="+" dispatch={dispatch}/>
      <DigitButton digit="7" dispatch={dispatch}/>
      <DigitButton digit="8" dispatch={dispatch}/>
      <DigitButton digit="9" dispatch={dispatch}/>
      <OperationButton operation="-" dispatch={dispatch}/>
      <DigitButton digit="." dispatch={dispatch}/>
      <DigitButton digit="0" dispatch={dispatch}/>
      <button className="two-column" onClick={() => dispatch({type: ACTIONS.EVALUATE})}>=</button>
    </div>
  );
}
