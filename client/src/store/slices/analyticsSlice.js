import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  dashboardSummary: null,
  incomeVsExpenses: null,
  spendingByCategory: [],
  monthlyTrends: [],
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setDashboardSummary: (state, action) => {
      state.dashboardSummary = action.payload;
    },
    setIncomeVsExpenses: (state, action) => {
      state.incomeVsExpenses = action.payload;
    },
    setSpendingByCategory: (state, action) => {
      state.spendingByCategory = action.payload;
    },
    setMonthlyTrends: (state, action) => {
      state.monthlyTrends = action.payload;
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
  setDashboardSummary,
  setIncomeVsExpenses,
  setSpendingByCategory,
  setMonthlyTrends,
  setLoading,
  setError,
} = analyticsSlice.actions;
export default analyticsSlice.reducer;

