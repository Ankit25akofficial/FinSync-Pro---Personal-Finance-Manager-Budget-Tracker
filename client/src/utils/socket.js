import { io } from 'socket.io-client';
import { store } from '../store/store';
import { addTransaction, updateTransaction, deleteTransaction } from '../store/slices/transactionSlice';
import { updateBudget } from '../store/slices/budgetSlice';
import toast from 'react-hot-toast';

let socket = null;

export const initializeSocket = (userId) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Socket connected');
    socket.emit('join-user-room', userId);
  });

  socket.on('transaction-added', (transaction) => {
    store.dispatch(addTransaction(transaction));
    toast.success('New transaction added!');
  });

  socket.on('transaction-updated', (transaction) => {
    store.dispatch(updateTransaction(transaction));
    toast.success('Transaction updated!');
  });

  socket.on('transaction-deleted', ({ id }) => {
    store.dispatch(deleteTransaction(id));
    toast.success('Transaction deleted!');
  });

  socket.on('budget-alert', (alert) => {
    if (alert.type === 'exceeded') {
      toast.error(`Budget exceeded for ${alert.category}!`);
    } else if (alert.type === 'warning') {
      toast.warning(`Budget warning: ${alert.category} at ${alert.percentage}%`);
    }
  });

  socket.on('budget-updated', (budget) => {
    store.dispatch(updateBudget(budget));
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Export socket instance getter
export { socket };

export const getSocket = () => socket;

