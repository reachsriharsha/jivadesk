/**
 * Profile Setup Form Component
 * Captures doctor's professional details for first-time profile completion
 */

import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { logger } from '../../utils/logger';
import type {
  ProfileSetupFormData,
  ProfileSetupFormErrors,
} from '../../types/auth';
import { SPECIALIZATIONS } from '../../types/auth';

const ProfileSetupForm: React.FC = () => {
  const { setupProfile, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState<ProfileSetupFormData>({
    fullName: '',
    medicalRegistrationNumber: '',
    qualification: '',
    specialization: '',
  });

  const [customSpecialization, setCustomSpecialization] = useState('');
  const [errors, setErrors] = useState<ProfileSetupFormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ProfileSetupFormErrors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    } else if (!/^[A-Za-z\s.\-]+$/.test(formData.fullName)) {
      newErrors.fullName =
        'Full name can only contain letters, spaces, dots, and hyphens';
    }

    // Medical registration number validation
    if (!formData.medicalRegistrationNumber.trim()) {
      newErrors.medicalRegistrationNumber =
        'Medical registration number is required';
    } else if (formData.medicalRegistrationNumber.length < 5) {
      newErrors.medicalRegistrationNumber =
        'Registration number must be at least 5 characters';
    } else if (!/^[A-Za-z0-9\-/]+$/.test(formData.medicalRegistrationNumber)) {
      newErrors.medicalRegistrationNumber =
        'Registration number can only contain letters, numbers, hyphens, and slashes';
    }

    // Qualification validation
    if (!formData.qualification.trim()) {
      newErrors.qualification = 'Qualification is required';
    } else if (formData.qualification.length < 2) {
      newErrors.qualification = 'Qualification must be at least 2 characters';
    }

    // Specialization validation
    const finalSpecialization =
      formData.specialization === 'Other'
        ? customSpecialization
        : formData.specialization;
    if (!finalSpecialization.trim()) {
      newErrors.specialization = 'Specialization is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error on change
    if (errors[name as keyof ProfileSetupFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Clear general error
    if (error) {
      clearError();
    }
  };

  const handleCustomSpecializationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomSpecialization(e.target.value);
    if (errors.specialization) {
      setErrors((prev) => ({ ...prev, specialization: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      logger.warn('profile_setup_validation_failed', {
        errorCount: Object.keys(errors).length,
      });
      return;
    }

    const finalSpecialization =
      formData.specialization === 'Other'
        ? customSpecialization
        : formData.specialization;

    try {
      await setupProfile({
        ...formData,
        specialization: finalSpecialization,
      });

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      // Error is handled by store
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {/* General Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Full Name Field */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.fullName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Dr. Rajesh Kumar"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>

        {/* Medical Registration Number Field */}
        <div>
          <label
            htmlFor="medicalRegistrationNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Medical Registration Number <span className="text-red-500">*</span>
          </label>
          <input
            id="medicalRegistrationNumber"
            name="medicalRegistrationNumber"
            type="text"
            value={formData.medicalRegistrationNumber}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.medicalRegistrationNumber
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            placeholder="MCI-12345 or KMC/12345"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter your MCI or State Medical Council registration number
          </p>
          {errors.medicalRegistrationNumber && (
            <p className="mt-1 text-sm text-red-600">
              {errors.medicalRegistrationNumber}
            </p>
          )}
        </div>

        {/* Qualification Field */}
        <div>
          <label
            htmlFor="qualification"
            className="block text-sm font-medium text-gray-700"
          >
            Qualification <span className="text-red-500">*</span>
          </label>
          <input
            id="qualification"
            name="qualification"
            type="text"
            value={formData.qualification}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.qualification ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="MBBS, MD (General Medicine)"
          />
          {errors.qualification && (
            <p className="mt-1 text-sm text-red-600">{errors.qualification}</p>
          )}
        </div>

        {/* Specialization Field */}
        <div>
          <label
            htmlFor="specialization"
            className="block text-sm font-medium text-gray-700"
          >
            Specialization <span className="text-red-500">*</span>
          </label>
          <select
            id="specialization"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.specialization ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select specialization</option>
            {SPECIALIZATIONS.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
          {formData.specialization === 'Other' && (
            <input
              type="text"
              value={customSpecialization}
              onChange={handleCustomSpecializationChange}
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your specialization"
            />
          )}
          {errors.specialization && (
            <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Saving...' : 'Complete Profile'}
      </button>
    </form>
  );
};

export default ProfileSetupForm;
