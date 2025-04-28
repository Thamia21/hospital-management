import React, { createContext, useContext, useReducer } from 'react';
import { Backdrop, CircularProgress } from '@mui/material';

const LoadingContext = createContext(null);

// Action types
const SHOW_LOADING = 'SHOW_LOADING';
const HIDE_LOADING = 'HIDE_LOADING';

// Initial state
const initialState = {
  isLoading: false,
  loadingStack: [], // Keep track of multiple loading states
};

// Reducer
function loadingReducer(state, action) {
  switch (action.type) {
    case SHOW_LOADING:
      return {
        ...state,
        isLoading: true,
        loadingStack: [...state.loadingStack, action.payload || 'global'],
      };
    case HIDE_LOADING:
      const newStack = state.loadingStack.filter(id => id !== action.payload);
      return {
        ...state,
        isLoading: newStack.length > 0,
        loadingStack: newStack,
      };
    default:
      return state;
  }
}

export function LoadingProvider({ children }) {
  const [state, dispatch] = useReducer(loadingReducer, initialState);

  const showLoading = (id = 'global') => {
    dispatch({ type: SHOW_LOADING, payload: id });
  };

  const hideLoading = (id = 'global') => {
    dispatch({ type: HIDE_LOADING, payload: id });
  };

  return (
    <LoadingContext.Provider value={{ ...state, showLoading, hideLoading }}>
      {children}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 2,
          flexDirection: 'column',
          gap: 2
        }}
        open={state.isLoading}
      >
        <CircularProgress color="inherit" />
        {state.loadingStack.length > 1 && (
          <div style={{ color: 'white', marginTop: '8px' }}>
            Processing {state.loadingStack.length} operations...
          </div>
        )}
      </Backdrop>
    </LoadingContext.Provider>
  );
}

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
