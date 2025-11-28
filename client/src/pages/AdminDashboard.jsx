import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiAlertTriangle, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { adminAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, alertsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getFraudAlerts({ status: 'pending' }),
        adminAPI.getUsers(),
      ]);
      setStats(statsRes.data.data);
      setFraudAlerts(alertsRes.data.data);
      setUsers(usersRes.data.data);
    } catch (error) {
      toast.error('Failed to load admin data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAlert = async (id, status) => {
    try {
      await adminAPI.updateFraudAlert(id, { status });
      toast.success('Alert updated');
      loadAdminData();
    } catch (error) {
      toast.error('Failed to update alert');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: FiUsers,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Total Transactions',
      value: stats?.totalTransactions || 0,
      icon: FiDollarSign,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Pending Alerts',
      value: stats?.pendingAlerts || 0,
      icon: FiAlertTriangle,
      color: 'from-red-500 to-pink-500',
    },
    {
      title: 'Total Income',
      value: `₹${(stats?.totalIncome || 0).toLocaleString('en-IN')}`,
      icon: FiTrendingUp,
      color: 'from-purple-500 to-indigo-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Manage system and monitor fraud alerts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card"
            >
              <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} w-fit mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fraud Alerts */}
        <div className="glass-card">
          <h2 className="text-xl font-bold text-white mb-6">Fraud Alerts</h2>
          {fraudAlerts.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No pending alerts</p>
          ) : (
            <div className="space-y-3">
              {fraudAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className="p-4 rounded-lg bg-red-500/10 border border-red-500/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-white mb-2">{alert.description}</p>
                  <p className="text-sm text-gray-400 mb-3">
                    User: {alert.userId?.email || 'N/A'} | Amount: ₹{alert.amount?.toLocaleString('en-IN') || 'N/A'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateAlert(alert._id, 'resolved')}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm text-white"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleUpdateAlert(alert._id, 'false_positive')}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm text-white"
                    >
                      False Positive
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Users List */}
        <div className="glass-card">
          <h2 className="text-xl font-bold text-white mb-6">All Users</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user._id}
                className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
                <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                  user.role === 'admin'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

