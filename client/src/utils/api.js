import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage for auth interceptor
let authTokenGetter = null;

// Set the token getter function (will be set from App component)
export const setAuthTokenGetter = (getter) => {
  authTokenGetter = getter;
};

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    if (authTokenGetter) {
      const token = await authTokenGetter();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return config;
});

// Transactions
export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getOne: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
};

// Budgets
export const budgetAPI = {
  getAll: (params) => api.get('/budgets', { params }),
  getOne: (id) => api.get(`/budgets/${id}`),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
};

// Analytics
export const analyticsAPI = {
  getDashboardSummary: () => api.get('/analytics/dashboard-summary'),
  getIncomeVsExpenses: (params) => api.get('/analytics/income-vs-expenses', { params }),
  getSpendingByCategory: (params) => api.get('/analytics/spending-by-category', { params }),
  getMonthlyTrends: (params) => api.get('/analytics/monthly-trends', { params }),
};

// Goals
export const goalAPI = {
  getAll: (params) => api.get('/goals', { params }),
  getOne: (id) => api.get(`/goals/${id}`),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
};

// Investments
export const investmentAPI = {
  getAll: (params) => api.get('/investments', { params }),
  getOne: (id) => api.get(`/investments/${id}`),
  create: (data) => api.post('/investments', data),
  update: (id, data) => api.put(`/investments/${id}`, data),
  delete: (id) => api.delete(`/investments/${id}`),
};

// OCR
export const ocrAPI = {
  processImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/ocr/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  processPDF: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/ocr/pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  importTransactions: (transactions) => api.post('/ocr/import', { transactions }),
};

// AI
export const aiAPI = {
  chat: (message) => api.post('/ai/chat', { message }),
  categorize: (description) => api.post('/ai/categorize', { description }),
  getSuggestions: () => api.get('/ai/suggestions'),
};

// Export
export const exportAPI = {
  excel: (params) => api.get('/export/excel', { params, responseType: 'blob' }),
  csv: (params) => api.get('/export/csv', { params, responseType: 'blob' }),
  pdf: (params) => api.get('/export/pdf', { params, responseType: 'blob' }),
};

// Admin
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getFraudAlerts: (params) => api.get('/admin/fraud-alerts', { params }),
  updateFraudAlert: (id, data) => api.put(`/admin/fraud-alerts/${id}`, data),
  getStats: () => api.get('/admin/stats'),
};

// User
export const userAPI = {
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  getStats: () => api.get('/auth/stats'),
  resetAllData: () => api.delete('/auth/reset'),
};

export default api;

