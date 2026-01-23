/**
 * Login page component
 */

import React from 'react';
import LoginForm from '../components/forms/LoginForm';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">JivaDesk</h1>
          <h2 className="mt-6 text-2xl font-semibold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Register Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
