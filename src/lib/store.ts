
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Create a simple counter reducer as a placeholder
// You can replace this with your actual reducers later
const counterReducer = (state = { value: 0 }, action) => {
  switch (action.type) {
    case 'counter/increment':
      return { ...state, value: state.value + 1 };
    case 'counter/decrement':
      return { ...state, value: state.value - 1 };
    default:
      return state;
  }
};

// Create the store
export const store = configureStore({
  reducer: {
    // Add our counterReducer to fix the "no valid reducer" error
    counter: counterReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Enable listener behavior for the store
setupListeners(store.dispatch);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
