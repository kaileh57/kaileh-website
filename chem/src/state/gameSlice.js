import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  turn: 1,
  totalTurns: 4, // As per spec section 13
  resources: {
    budget: 200, // Initial budget in Billions, as per spec section 13
    approval: 65, // Initial approval %
    gridStability: 70, // Initial grid stability %
    emissions: 100, // Initial emissions % (baseline)
  },
  techLevels: {
    solar: 60,
    wind: 65,
    storage: 70,
    nuclear: 60,
    grid: 70,
  },
  // Add other game states as needed: selectedInvestments, selectedPolicies, currentEvent, etc.
  gamePhase: 'title', // e.g., 'title', 'investment', 'policy', 'summary', 'event', 'gameOver'
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Example reducer: Increment turn
    incrementTurn: (state) => {
      if (state.turn < state.totalTurns) {
        state.turn += 1;
      } else {
        state.gamePhase = 'gameOver';
      }
    },
    // Example reducer: Change game phase
    setGamePhase: (state, action) => {
      state.gamePhase = action.payload; // Expects a string payload like 'investment'
    },
    // Example reducer: Update budget
    updateBudget: (state, action) => {
      state.resources.budget = action.payload; // Expects the new budget number
    },
    // Add more reducers here for investments, policies, events, etc.
  },
});

// Action creators are generated for each case reducer function
export const { incrementTurn, setGamePhase, updateBudget } = gameSlice.actions;

export default gameSlice.reducer; 