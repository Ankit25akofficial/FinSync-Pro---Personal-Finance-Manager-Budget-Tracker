import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrash2, FiAlertTriangle, FiRefreshCw, FiBarChart2 } from 'react-icons/fi';
import { userAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  const loadStats = async () => {
    try {
      const response = await userAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleResetAllData = async () => {
    try {
      setLoading(true);
      await userAPI.resetAllData();
      toast.success('All data has been reset successfully!');
      setShowResetModal(false);
      
      // Reload the page to refresh all data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reset data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account and data</p>
      </div>

      {/* Data Statistics */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >
          <div className="flex items-center gap-3 mb-4">
            <FiBarChart2 className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Your Data</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Transactions</p>
              <p className="text-2xl font-bold text-white">{stats.transactions}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Budgets</p>
              <p className="text-2xl font-bold text-white">{stats.budgets}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Goals</p>
              <p className="text-2xl font-bold text-white">{stats.goals}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Investments</p>
              <p className="text-2xl font-bold text-white">{stats.investments}</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Total items: <span className="text-white font-semibold">{stats.total}</span>
          </p>
        </motion.div>
      )}

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card border-2 border-red-500/30"
      >
        <div className="flex items-center gap-3 mb-4">
          <FiAlertTriangle className="w-5 h-5 text-red-400" />
          <h2 className="text-xl font-bold text-red-400">Danger Zone</h2>
        </div>
        
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
          <h3 className="text-white font-semibold mb-2">Reset All Data</h3>
          <p className="text-sm text-gray-300 mb-4">
            This will permanently delete all your transactions, budgets, goals, and investments. 
            This action cannot be undone. Your user account will remain, but all financial data will be lost.
          </p>
          <button
            onClick={() => setShowResetModal(true)}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg text-white font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiTrash2 className="w-5 h-5" />
            Reset All Data
          </button>
        </div>
      </motion.div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <FiAlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Confirm Reset</h2>
                <p className="text-sm text-gray-400">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-white mb-2">
                Are you absolutely sure you want to delete all your data?
              </p>
              <ul className="text-sm text-gray-300 list-disc list-inside space-y-1">
                <li>All transactions will be deleted</li>
                <li>All budgets will be deleted</li>
                <li>All goals will be deleted</li>
                <li>All investments will be deleted</li>
              </ul>
              <p className="text-sm text-red-300 mt-3 font-semibold">
                ⚠️ This action is permanent and cannot be reversed!
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetAllData}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FiRefreshCw className="w-5 h-5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="w-5 h-5" />
                    Yes, Delete Everything
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Settings;

