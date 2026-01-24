// Main App component for JivaDesk
import React, { useEffect } from 'react';
import Register from './pages/Register';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import { useAuthStore } from './stores/authStore';

function App() {
  const { user, accessToken, fetchCurrentUser } = useAuthStore();
  const path = window.location.pathname;

  // Check for existing session on app load
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token && !user) {
      fetchCurrentUser();
    }
  }, []);

  // Public routes
  if (path === '/register') {
    return <Register />;
  }

  if (path === '/login') {
    return <Login />;
  }

  // Protected route: Profile Setup
  if (path === '/profile-setup') {
    // Only allow access if logged in
    if (!accessToken && !localStorage.getItem('access_token')) {
      window.location.href = '/login';
      return null;
    }
    return <ProfileSetup />;
  }

  // Protected route: Dashboard
  if (path === '/dashboard') {
    // Check authentication
    if (!accessToken && !localStorage.getItem('access_token')) {
      window.location.href = '/login';
      return null;
    }

    // Check profile completion
    if (user && !user.is_profile_complete) {
      window.location.href = '/profile-setup';
      return null;
    }

    // Dashboard placeholder
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-gray-600 mb-4">
            Welcome, {user?.full_name || 'Doctor'}!
          </p>
          <p className="text-sm text-gray-500 mb-8">
            {user?.qualification} | {user?.specialization}
          </p>
          <button
            onClick={async () => {
              await useAuthStore.getState().logout();
              window.location.href = '/login';
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Default: Landing page
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">JivaDesk</h1>
        <p className="text-gray-600 mb-8">Doctor Practice Management System</p>
        <div className="space-x-4">
          <a
            href="/register"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Register
          </a>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
