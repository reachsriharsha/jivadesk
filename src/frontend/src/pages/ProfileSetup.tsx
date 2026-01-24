/**
 * Profile Setup Page
 * First-time profile completion for new users
 */

import React from 'react';
import ProfileSetupForm from '../components/forms/ProfileSetupForm';

const ProfileSetup: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">JivaDesk</h1>
          <h2 className="mt-6 text-2xl font-semibold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please provide your professional details to get started
          </p>
        </div>

        {/* Profile Setup Form */}
        <ProfileSetupForm />
      </div>
    </div>
  );
};

export default ProfileSetup;
