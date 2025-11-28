import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  budgets: [],
  loading: false,
  error: null,
};

const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    setBudgets: (state, action) => {
      state.budgets = action.payload;
    },
    addBudget: (state, action) => {
      state.budgets.push(action.payload);
    },
    updateBudget: (state, action) => {
      const index = state.budgets.findIndex(b => b._id === action.payload._id);
      if (index !== -1) {
        state.budgets[index] = action.payload;
      }
    },
    deleteBudget: (state, action) => {
      state.budgets = state.budgets.filter(b => b._id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setBudgets,
  addBudget,
  updateBudget,
  deleteBudget,
  setLoading,
  setError,
} = budgetSlice.actions;
export default budgetSlice.reducer;

