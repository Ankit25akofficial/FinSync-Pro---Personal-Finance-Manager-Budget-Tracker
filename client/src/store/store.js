import { configureStore } from '@reduxjs/toolkit';
import userSlice from './slices/userSlice';
import transactionSlice from './slices/transactionSlice';
import budgetSlice from './slices/budgetSlice';
import analyticsSlice from './slices/analyticsSlice';

export const store = configureStore({
  reducer: {
    user: userSlice,
    transactions: transactionSlice,
    budgets: budgetSlice,
    analytics: analyticsSlice,
  },
});

