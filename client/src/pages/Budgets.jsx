import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { budgetAPI } from '../utils/api';
import { setBudgets, deleteBudget } from '../store/slices/budgetSlice';
import BudgetModal from '../components/BudgetModal';
import toast from 'react-hot-toast';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const Budgets = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { budgets } = useSelector((state) => state.budgets);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const response = await budgetAPI.getAll({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });
      dispatch(setBudgets(response.data.data));
    } catch (error) {
      toast.error('Failed to load budgets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    
    try {
      await budgetAPI.delete(id);
      dispatch(deleteBudget(id));
      toast.success('Budget deleted');
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setShowModal(true);
  };

  const getPercentage = (budget) => {
    return budget.monthlyLimit > 0
      ? Math.min((budget.currentSpent / budget.monthlyLimit) * 100, 100)
      : 0;
  };

  const getColor = (percentage) => {
    if (percentage >= 100) return '#ef4444';
    if (percentage >= 80) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Budgets</h1>
          <p className="text-gray-400">Track and manage your monthly budgets</p>
        </div>
        <button
          onClick={() => {
            setEditingBudget(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Budget</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="glass-card bg-blue-500/10 border-blue-500/30">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">How Budget Tracking Works</h3>
            <p className="text-sm text-gray-300">
              Budgets automatically track spending when you add <strong>expense transactions</strong> with matching categories. 
              For example, if you create a "Food" budget of ₹5,000, adding a "Food" expense transaction of ₹500 will automatically 
              update your budget to show ₹500 spent (10%).
            </p>
            <p className="text-xs text-gray-400 mt-2">
              <strong>Tip:</strong> Make sure the transaction category matches your budget category for automatic tracking.
            </p>
            <button
              onClick={() => navigate('/transactions')}
              className="mt-3 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors flex items-center gap-2"
            >
              Go to Transactions
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : budgets.length === 0 ? (
        <div className="glass-card text-center py-12">
          <p className="text-gray-400 mb-4">No budgets set for this month</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white"
          >
            Create Your First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget, index) => {
            const percentage = getPercentage(budget);
            return (
              <motion.div
                key={budget._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{budget.category}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="p-2 hover:bg-white/10 rounded transition-colors"
                    >
                      <FiEdit className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget._id)}
                      className="p-2 hover:bg-white/10 rounded transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center mb-4">
                  <div style={{ width: 120, height: 120 }}>
                    <CircularProgressbar
                      value={percentage}
                      text={`${percentage.toFixed(0)}%`}
                      styles={buildStyles({
                        pathColor: getColor(percentage),
                        textColor: '#fff',
                        trailColor: 'rgba(255, 255, 255, 0.1)',
                        textSize: '14px',
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Limit</span>
                    <span className="text-white font-semibold">
                      ₹{budget.monthlyLimit.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Spent</span>
                    <span className="text-white font-semibold">
                      ₹{budget.currentSpent.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Remaining</span>
                    <span className={`font-semibold ${
                      budget.monthlyLimit - budget.currentSpent > 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                      ₹{(budget.monthlyLimit - budget.currentSpent).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {percentage >= 80 && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    percentage >= 100
                      ? 'bg-red-500/20 border border-red-500/30'
                      : 'bg-yellow-500/20 border border-yellow-500/30'
                  }`}>
                    <p className={`text-sm ${
                      percentage >= 100 ? 'text-red-300' : 'text-yellow-300'
                    }`}>
                      {percentage >= 100
                        ? '⚠️ Budget exceeded!'
                        : '⚠️ Approaching limit'}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {showModal && (
        <BudgetModal
          budget={editingBudget}
          onClose={() => {
            setShowModal(false);
            setEditingBudget(null);
          }}
          onSuccess={() => {
            loadBudgets();
            setShowModal(false);
            setEditingBudget(null);
          }}
        />
      )}
    </div>
  );
};

export default Budgets;

