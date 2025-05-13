// Redux Toolkit store configuration will go here
import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    // Add other reducers here as needed (e.g., map, turn, ui)
  },
});

export default store; 