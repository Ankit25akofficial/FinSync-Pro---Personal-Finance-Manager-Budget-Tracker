import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FiDollarSign, FiTrendingUp, FiTrendingDown, FiPieChart,
  FiArrowUpRight, FiArrowDownRight
} from 'react-icons/fi';
import { analyticsAPI } from '../utils/api';
import { setDashboardSummary } from '../store/slices/analyticsSlice';
import BudgetWheel from '../components/BudgetWheel';
import RecentTransactions from '../components/RecentTransactions';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { dashboardSummary } = useSelector((state) => state.analytics);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getDashboardSummary();
      dispatch(setDashboardSummary(response.data.data));
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Wallet Balance',
      value: `₹${dashboardSummary?.walletBalance?.toLocaleString('en-IN') || 0}`,
      icon: FiDollarSign,
      color: 'from-blue-500 to-cyan-500',
      change: '+12.5%',
      trend: 'up',
    },
    {
      title: 'Monthly Income',
      value: `₹${dashboardSummary?.monthlyIncome?.toLocaleString('en-IN') || 0}`,
      icon: FiTrendingUp,
      color: 'from-green-500 to-emerald-500',
      change: '+5.2%',
      trend: 'up',
    },
    {
      title: 'Monthly Expenses',
      value: `₹${dashboardSummary?.monthlyExpenses?.toLocaleString('en-IN') || 0}`,
      icon: FiTrendingDown,
      color: 'from-red-500 to-pink-500',
      change: '-3.1%',
      trend: 'down',
    },
    {
      title: 'Monthly Savings',
      value: `₹${dashboardSummary?.monthlySavings?.toLocaleString('en-IN') || 0}`,
      icon: FiPieChart,
      color: 'from-purple-500 to-indigo-500',
      change: '+8.7%',
      trend: 'up',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card group hover:scale-105 transition-transform"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.trend === 'up' ? (
                    <FiArrowUpRight className="w-4 h-4" />
                  ) : (
                    <FiArrowDownRight className="w-4 h-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Budget and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetWheel />
        <RecentTransactions transactions={dashboardSummary?.recentTransactions || []} />
      </div>
    </div>
  );
};

export default Dashboard;

