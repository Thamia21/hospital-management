import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

const ErrorContext = createContext(null);

// Action types
const ADD_ERROR = 'ADD_ERROR';
const REMOVE_ERROR = 'REMOVE_ERROR';
const CLEAR_ERRORS = 'CLEAR_ERRORS';

// Initial state
const initialState = {
  errors: [], // Array of error objects with id, message, and severity
};

// Reducer
function errorReducer(state, action) {
  switch (action.type) {
    case ADD_ERROR:
      return {
        ...state,
        errors: [...state.errors, action.payload],
      };
    case REMOVE_ERROR:
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload),
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        errors: [],
      };
    default:
      return state;
  }
}

export function ErrorProvider({ children }) {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  const addError = useCallback((message, severity = 'error') => {
    const id = Date.now().toString();
    dispatch({
      type: ADD_ERROR,
      payload: { id, message, severity },
    });
    // Auto-remove error after 6 seconds
    setTimeout(() => {
      dispatch({ type: REMOVE_ERROR, payload: id });
    }, 6000);
    return id;
  }, []);

  const removeError = useCallback((id) => {
    dispatch({ type: REMOVE_ERROR, payload: id });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: CLEAR_ERRORS });
  }, []);

  // Helper methods for different types of messages
  const showError = useCallback((message) => addError(message, 'error'), [addError]);
  const showWarning = useCallback((message) => addError(message, 'warning'), [addError]);
  const showInfo = useCallback((message) => addError(message, 'info'), [addError]);
  const showSuccess = useCallback((message) => addError(message, 'success'), [addError]);

  return (
    <ErrorContext.Provider 
      value={{ 
        errors: state.errors, 
        addError,
        removeError, 
        clearErrors,
        showError,
        showWarning,
        showInfo,
        showSuccess
      }}
    >
      {children}
      {state.errors.map((error) => (
        <Snackbar
          key={error.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          onClose={() => removeError(error.id)}
        >
          <Alert
            onClose={() => removeError(error.id)}
            severity={error.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {error.message}
          </Alert>
        </Snackbar>
      ))}
    </ErrorContext.Provider>
  );
}

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};
