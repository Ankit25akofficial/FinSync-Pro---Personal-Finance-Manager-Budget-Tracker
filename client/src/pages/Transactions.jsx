import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiFilter, FiEdit, FiTrash2, FiDownload } from 'react-icons/fi';
import { transactionAPI, exportAPI } from '../utils/api';
import { setTransactions, deleteTransaction, setFilters } from '../store/slices/transactionSlice';
import TransactionModal from '../components/TransactionModal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Transactions = () => {
  const dispatch = useDispatch();
  const { transactions, filters } = useSelector((state) => state.transactions);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionAPI.getAll(filters);
      if (response.data && response.data.success) {
        dispatch(setTransactions(response.data.data || []));
      } else {
        dispatch(setTransactions([]));
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load transactions';
      
      // Check for specific error types
      if (error.response?.status === 503 || errorMessage.includes('Database not connected')) {
        setError('database');
      } else if (error.message.includes('Network Error') || error.code === 'ECONNREFUSED') {
        setError('connection');
      } else {
        setError('general');
        toast.error(errorMessage);
      }
      
      dispatch(setTransactions([]));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      await transactionAPI.delete(id);
      dispatch(deleteTransaction(id));
      toast.success('Transaction deleted');
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  const handleExport = async (format) => {
    try {
      let response;
      let filename;
      let mimeType;

      if (format === 'excel') {
        response = await exportAPI.excel(filters);
        filename = `transactions-${Date.now()}.xlsx`;
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else if (format === 'csv') {
        response = await exportAPI.csv(filters);
        filename = `transactions-${Date.now()}.csv`;
        mimeType = 'text/csv';
      } else {
        response = await exportAPI.pdf(filters);
        filename = `transactions-${Date.now()}.pdf`;
        mimeType = 'application/pdf';
      }

      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export successful');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Transactions</h1>
          <p className="text-gray-400">Manage your income and expenses</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <button
              onClick={() => handleExport('excel')}
              className="glass px-4 py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <FiDownload className="w-5 h-5" />
              <span className="hidden md:inline">Export</span>
            </button>
          </div>
          <button
            onClick={() => {
              setEditingTransaction(null);
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={filters.search || ''}
                onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
          <select
            value={filters.type || ''}
            onChange={(e) => dispatch(setFilters({ type: e.target.value }))}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            value={filters.category || ''}
            onChange={(e) => dispatch(setFilters({ category: e.target.value }))}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">All Categories</option>
            <option value="Food">Food</option>
            <option value="Rent">Rent</option>
            <option value="Travel">Travel</option>
            <option value="Bills">Bills</option>
            <option value="Shopping">Shopping</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Food Delivery">Food Delivery</option>
            <option value="Transport">Transport</option>
            <option value="Utilities">Utilities</option>
            <option value="Subscriptions">Subscriptions</option>
            <option value="Salary">Salary</option>
            <option value="Freelance">Freelance</option>
            <option value="Investment">Investment</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => dispatch(setFilters({ startDate: e.target.value }))}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
          />
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => dispatch(setFilters({ endDate: e.target.value }))}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error === 'database' ? (
          <div className="text-center py-12">
            <div className="mb-4 text-6xl">🗄️</div>
            <h3 className="text-xl font-bold text-white mb-2">Database Not Connected</h3>
            <p className="text-gray-400 mb-4">MongoDB is required to store and retrieve transactions.</p>
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-4 text-left max-w-2xl mx-auto">
              <p className="text-yellow-300 font-semibold mb-2">Setup Options:</p>
              <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                <li><strong>MongoDB Atlas (Recommended):</strong> Free cloud database
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Sign up at <a href="https://www.mongodb.com/cloud/atlas" target="_blank" className="text-blue-400 underline">mongodb.com/cloud/atlas</a></li>
                    <li>Create a free cluster</li>
                    <li>Get your connection string</li>
                    <li>Update <code className="bg-black/30 px-1 rounded">server/.env</code> with <code className="bg-black/30 px-1 rounded">MONGODB_URI</code></li>
                  </ul>
                </li>
                <li><strong>Local MongoDB:</strong> Install MongoDB locally and ensure it's running</li>
              </ol>
            </div>
            <button
              onClick={loadTransactions}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white"
            >
              Retry Connection
            </button>
          </div>
        ) : error === 'connection' ? (
          <div className="text-center py-12">
            <div className="mb-4 text-6xl">🔌</div>
            <h3 className="text-xl font-bold text-white mb-2">Backend Server Not Connected</h3>
            <p className="text-gray-400 mb-4">Unable to reach the backend server.</p>
            <p className="text-sm text-gray-500 mb-6">Make sure the backend server is running on port 5000</p>
            <button
              onClick={loadTransactions}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white"
            >
              Retry Connection
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No transactions found</p>
            <p className="text-sm text-gray-500 mb-6">
              {filters.type || filters.category || filters.search || filters.startDate || filters.endDate
                ? 'Try adjusting your filters'
                : 'Start by adding your first transaction'}
            </p>
            <button
              onClick={() => {
                setEditingTransaction(null);
                setShowModal(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Add Your First Transaction
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Category</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Description</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Amount</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction._id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-4 text-white">
                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      transaction.type === 'income'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white">{transaction.category}</td>
                  <td className="py-3 px-4 text-gray-300">{transaction.description || '-'}</td>
                  <td className={`py-3 px-4 text-right font-semibold ${
                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                      >
                        <FiEdit className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction._id)}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <TransactionModal
          transaction={editingTransaction}
          onClose={() => {
            setShowModal(false);
            setEditingTransaction(null);
          }}
          onSuccess={() => {
            loadTransactions();
            setShowModal(false);
            setEditingTransaction(null);
          }}
        />
      )}
    </div>
  );
};

export default Transactions;

