import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useUser, SignOutButton } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { 
  FiHome, FiDollarSign, FiPieChart, FiTrendingUp, 
  FiTarget, FiBriefcase, FiSettings, FiLogOut, FiShield
} from 'react-icons/fi';
import { useState } from 'react';

const Layout = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/transactions', icon: FiDollarSign, label: 'Transactions' },
    { path: '/budgets', icon: FiPieChart, label: 'Budgets' },
    { path: '/analytics', icon: FiTrendingUp, label: 'Analytics' },
    { path: '/goals', icon: FiTarget, label: 'Goals' },
    { path: '/investments', icon: FiBriefcase, label: 'Investments' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  const isAdmin = user?.publicMetadata?.role === 'admin';

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="hidden md:flex flex-col w-64 glass-dark border-r border-white/10 p-6"
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gradient">FinSync Pro</h1>
          <p className="text-sm text-gray-400 mt-1">Finance Manager</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <FiShield className="w-5 h-5" />
              <span>Admin</span>
            </NavLink>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
              {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
          <SignOutButton>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-all">
              <FiLogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </SignOutButton>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className="fixed md:hidden left-0 top-0 bottom-0 w-64 glass-dark border-r border-white/10 p-6 z-50"
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gradient">FinSync Pro</h1>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg ${
                    isActive ? 'bg-purple-500/20 text-purple-300' : 'text-gray-300'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden glass-dark border-b border-white/10 p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gradient">FinSync Pro</h1>
          <div className="w-10" />
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

