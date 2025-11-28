import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { investmentAPI } from '../utils/api';
import InvestmentModal from '../components/InvestmentModal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    try {
      setLoading(true);
      const response = await investmentAPI.getAll();
      setInvestments(response.data.data);
      setSummary(response.data.summary);
    } catch (error) {
      toast.error('Failed to load investments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this investment?')) return;
    
    try {
      await investmentAPI.delete(id);
      setInvestments(investments.filter(i => i._id !== id));
      toast.success('Investment deleted');
      loadInvestments();
    } catch (error) {
      toast.error('Failed to delete investment');
    }
  };

  const handleEdit = (investment) => {
    setEditingInvestment(investment);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Investments</h1>
          <p className="text-gray-400">Track your investment portfolio</p>
        </div>
        <button
          onClick={() => {
            setEditingInvestment(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Investment</span>
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
          >
            <p className="text-gray-400 text-sm mb-1">Total Invested</p>
            <p className="text-2xl font-bold text-white">
              ₹{summary.totalInvested.toLocaleString('en-IN')}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card"
          >
            <p className="text-gray-400 text-sm mb-1">Current Value</p>
            <p className="text-2xl font-bold text-white">
              ₹{summary.totalCurrent.toLocaleString('en-IN')}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card"
          >
            <p className="text-gray-400 text-sm mb-1">Profit/Loss</p>
            <p className={`text-2xl font-bold ${
              summary.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {summary.totalProfitLoss >= 0 ? '+' : ''}₹{summary.totalProfitLoss.toLocaleString('en-IN')}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card"
          >
            <p className="text-gray-400 text-sm mb-1">Return %</p>
            <p className={`text-2xl font-bold ${
              parseFloat(summary.totalProfitLossPercentage) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {summary.totalProfitLossPercentage >= 0 ? '+' : ''}{summary.totalProfitLossPercentage}%
            </p>
          </motion.div>
        </div>
      )}

      {/* Investments List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : investments.length === 0 ? (
        <div className="glass-card text-center py-12">
          <p className="text-gray-400 mb-4">No investments tracked yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white"
          >
            Add Your First Investment
          </button>
        </div>
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Invested</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Current Value</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">P/L</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Return %</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((investment) => (
                <tr
                  key={investment._id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-4 text-white font-medium">{investment.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400">
                      {investment.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white">
                    ₹{investment.investedAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-white">
                    ₹{investment.currentValue.toLocaleString('en-IN')}
                  </td>
                  <td className={`py-3 px-4 font-semibold ${
                    investment.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <div className="flex items-center gap-1">
                      {investment.profitLoss >= 0 ? (
                        <FiTrendingUp className="w-4 h-4" />
                      ) : (
                        <FiTrendingDown className="w-4 h-4" />
                      )}
                      {investment.profitLoss >= 0 ? '+' : ''}₹{investment.profitLoss.toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td className={`py-3 px-4 font-semibold ${
                    parseFloat(investment.profitLossPercentage) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {investment.profitLossPercentage >= 0 ? '+' : ''}{investment.profitLossPercentage}%
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(investment)}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                      >
                        <FiEdit className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(investment._id)}
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
        </div>
      )}

      {showModal && (
        <InvestmentModal
          investment={editingInvestment}
          onClose={() => {
            setShowModal(false);
            setEditingInvestment(null);
          }}
          onSuccess={() => {
            loadInvestments();
            setShowModal(false);
            setEditingInvestment(null);
          }}
        />
      )}
    </div>
  );
};

export default Investments;

