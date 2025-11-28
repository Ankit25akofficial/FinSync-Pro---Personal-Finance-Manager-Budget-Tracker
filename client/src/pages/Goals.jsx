import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiTarget } from 'react-icons/fi';
import { goalAPI } from '../utils/api';
import GoalModal from '../components/GoalModal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const response = await goalAPI.getAll();
      setGoals(response.data.data);
    } catch (error) {
      toast.error('Failed to load goals');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      await goalAPI.delete(id);
      setGoals(goals.filter(g => g._id !== id));
      toast.success('Goal deleted');
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setShowModal(true);
  };

  const getProgress = (goal) => {
    return goal.targetAmount > 0
      ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
      : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Savings Goals</h1>
          <p className="text-gray-400">Track your financial goals</p>
        </div>
        <button
          onClick={() => {
            setEditingGoal(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Goal</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : goals.length === 0 ? (
        <div className="glass-card text-center py-12">
          <FiTarget className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No goals set yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, index) => {
            const progress = getProgress(goal);
            return (
              <motion.div
                key={goal._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FiTarget className="w-5 h-5 text-purple-400" />
                    <h3 className="text-xl font-bold text-white">{goal.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-2 hover:bg-white/10 rounded transition-colors"
                    >
                      <FiEdit className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal._id)}
                      className="p-2 hover:bg-white/10 rounded transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-gray-400 text-sm mb-4">{goal.description}</p>
                )}

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Progress</span>
                    <span className="text-white font-semibold">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Current</span>
                    <span className="text-white font-semibold">
                      ₹{goal.currentAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Target</span>
                    <span className="text-white font-semibold">
                      ₹{goal.targetAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Remaining</span>
                    <span className="text-green-400 font-semibold">
                      ₹{(goal.targetAmount - goal.currentAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-gray-400 mb-1">Target Date</p>
                  <p className="text-sm text-white">
                    {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
                  </p>
                  {goal.aiSuggestions?.weeklyAmount && (
                    <p className="text-xs text-purple-400 mt-2">
                      💡 Suggested weekly savings: ₹{goal.aiSuggestions.weeklyAmount.toFixed(0)}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    goal.status === 'completed'
                      ? 'bg-green-500/20 text-green-400'
                      : goal.status === 'paused'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {goal.status}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {showModal && (
        <GoalModal
          goal={editingGoal}
          onClose={() => {
            setShowModal(false);
            setEditingGoal(null);
          }}
          onSuccess={() => {
            loadGoals();
            setShowModal(false);
            setEditingGoal(null);
          }}
        />
      )}
    </div>
  );
};

export default Goals;

