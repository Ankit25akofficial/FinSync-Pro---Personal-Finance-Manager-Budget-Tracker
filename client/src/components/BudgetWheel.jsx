import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// Note: If react-circular-progressbar is not available, you can use a custom circular progress component

const BudgetWheel = () => {
  const { budgets } = useSelector((state) => state.budgets);
  const { dashboardSummary } = useSelector((state) => state.analytics);
  const navigate = useNavigate();

  const percentage = parseFloat(dashboardSummary?.budgetPercentage || 0);
  const totalLimit = dashboardSummary?.totalBudgetLimit || 0;
  const totalSpent = dashboardSummary?.totalBudgetSpent || 0;
  const hasBudgets = totalLimit > 0;

  const getColor = () => {
    if (percentage >= 100) return '#ef4444';
    if (percentage >= 80) return '#f59e0b';
    return '#10b981';
  };

  // Show empty state if no budgets
  if (!hasBudgets) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card"
      >
        <h2 className="text-xl font-bold text-white mb-6">Budget Overview</h2>
        
        <div className="text-center py-8">
          <div className="mb-4 text-6xl">📊</div>
          <h3 className="text-lg font-semibold text-white mb-2">No Budgets Set</h3>
          <p className="text-gray-400 mb-6 text-sm">
            Create budgets to track your spending and stay on top of your finances.
          </p>
          <button
            onClick={() => navigate('/budgets')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-white font-semibold"
          >
            Create Budget
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card"
    >
      <h2 className="text-xl font-bold text-white mb-6">Budget Overview</h2>
      
      <div className="flex items-center justify-center mb-6">
        <div style={{ width: 200, height: 200 }}>
          <CircularProgressbar
            value={Math.min(percentage, 100)}
            text={percentage > 0 ? `${percentage.toFixed(1)}%` : '0%'}
            styles={buildStyles({
              pathColor: getColor(),
              textColor: '#fff',
              trailColor: 'rgba(255, 255, 255, 0.1)',
              textSize: '16px',
            })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Total Budget</span>
          <span className="text-white font-semibold">₹{totalLimit.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Total Spent</span>
          <span className="text-white font-semibold">₹{totalSpent.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Remaining</span>
          <span className={`font-semibold ${
            totalLimit - totalSpent > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            ₹{(totalLimit - totalSpent).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {percentage >= 80 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mt-4 p-3 rounded-lg ${
            percentage >= 100
              ? 'bg-red-500/20 border border-red-500/30'
              : 'bg-yellow-500/20 border border-yellow-500/30'
          }`}
        >
          <p className={`text-sm ${
            percentage >= 100 ? 'text-red-300' : 'text-yellow-300'
          }`}>
            {percentage >= 100
              ? '⚠️ Budget exceeded! Consider reviewing your expenses.'
              : '⚠️ Budget warning: You\'re approaching your limit.'}
          </p>
        </motion.div>
      )}

      {percentage === 0 && totalLimit > 0 && (
        <div className="mt-4 p-4 rounded-lg bg-blue-500/20 border border-blue-500/30">
          <p className="text-sm text-blue-300 mb-3">
            💡 Great! You haven't spent anything from your budget yet this month.
          </p>
          <p className="text-xs text-blue-200 mb-3">
            <strong>How it works:</strong> Add expense transactions with matching categories to automatically track spending against your budgets.
          </p>
          <button
            onClick={() => navigate('/transactions')}
            className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <span>+</span> Add Expense Transaction
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default BudgetWheel;

