import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from './store/slices/userSlice';
import { initializeSocket } from './utils/socket';
import { setAuthTokenGetter } from './utils/api';

// Pages
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Analytics from './pages/Analytics';
import Goals from './pages/Goals';
import Investments from './pages/Investments';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import BackgroundAnimation from './components/BackgroundAnimation';

function App() {
  const { isSignedIn, userId, user, getToken } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    // Set up auth token getter for API calls
    setAuthTokenGetter(async () => {
      try {
        return await getToken();
      } catch (error) {
        console.error('Error getting token:', error);
        return null;
      }
    });
  }, [getToken]);

  useEffect(() => {
    if (isSignedIn && userId) {
      dispatch(setUser({
        userId,
        email: user?.emailAddresses[0]?.emailAddress,
        firstName: user?.firstName,
        lastName: user?.lastName
      }));
      initializeSocket(userId);
    }
    
    return () => {
      // Cleanup socket on unmount
      if (isSignedIn) {
        const { disconnectSocket } = require('./utils/socket');
        disconnectSocket();
      }
    };
  }, [isSignedIn, userId, user, dispatch]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundAnimation />
      <div className="relative z-10">
        <Routes>
          <Route path="/sign-in" element={!isSignedIn ? <SignInPage /> : <Navigate to="/dashboard" />} />
          <Route path="/sign-up" element={!isSignedIn ? <SignUpPage /> : <Navigate to="/dashboard" />} />
          
          {isSignedIn ? (
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/investments" element={<Investments />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/sign-in" />} />
          )}
        </Routes>
      </div>
    </div>
  );
}

export default App;

