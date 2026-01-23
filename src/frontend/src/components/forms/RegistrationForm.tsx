/**
 * Registration Form Component
 * 
 * Features:
 * - Real-time validation
 * - Email/phone availability checking
 * - Password strength indicator
 * - Terms acceptance
 */

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import {
  validateEmail,
  validatePhone,
  validatePassword,
  getPasswordStrength,
} from '../../utils/validation';
import type { RegisterFormData, ValidationErrors } from '../../types/auth';

export const RegistrationForm: React.FC = () => {
  const { register, checkEmailAvailable, checkPhoneAvailable, isLoading, error } =
    useAuthStore();

  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [phoneAvailable, setPhoneAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);

  // Check email availability with debounce
  useEffect(() => {
    const checkEmail = async () => {
      if (formData.email && !validateEmail(formData.email)) {
        setCheckingEmail(true);
        const available = await checkEmailAvailable(formData.email);
        setEmailAvailable(available);
        setCheckingEmail(false);
        if (!available) {
          setErrors((prev) => ({
            ...prev,
            email: 'Email already registered',
          }));
        }
      }
    };

    const timer = setTimeout(checkEmail, 500);
    return () => clearTimeout(timer);
  }, [formData.email, checkEmailAvailable]);

  // Check phone availability with debounce
  useEffect(() => {
    const checkPhone = async () => {
      if (formData.phone && !validatePhone(formData.phone)) {
        setCheckingPhone(true);
        const available = await checkPhoneAvailable(formData.phone);
        setPhoneAvailable(available);
        setCheckingPhone(false);
        if (!available) {
          setErrors((prev) => ({
            ...prev,
            phone: 'Phone number already registered',
          }));
        }
      }
    };

    const timer = setTimeout(checkPhone, 500);
    return () => clearTimeout(timer);
  }, [formData.phone, checkPhoneAvailable]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear availability checks when values change
    if (name === 'email') {
      setEmailAvailable(null);
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
    if (name === 'phone') {
      setPhoneAvailable(null);
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name);
  };

  const validateField = (fieldName: string) => {
    const newErrors: ValidationErrors = { ...errors };

    switch (fieldName) {
      case 'email':
        newErrors.email = validateEmail(formData.email);
        break;
      case 'phone':
        newErrors.phone = validatePhone(formData.phone);
        break;
      case 'password':
        newErrors.password = validatePassword(formData.password);
        break;
      case 'confirmPassword':
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          newErrors.confirmPassword = undefined;
        }
        break;
      case 'termsAccepted':
        if (!formData.termsAccepted) {
          newErrors.termsAccepted = 'You must accept the terms and conditions';
        } else {
          newErrors.termsAccepted = undefined;
        }
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      password: validatePassword(formData.password),
      confirmPassword:
        formData.password !== formData.confirmPassword
          ? 'Passwords do not match'
          : undefined,
      termsAccepted: !formData.termsAccepted
        ? 'You must accept the terms and conditions'
        : undefined,
    };

    // Check availability
    if (emailAvailable === false) {
      newErrors.email = 'Email already registered';
    }
    if (phoneAvailable === false) {
      newErrors.phone = 'Phone number already registered';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      termsAccepted: true,
    });

    if (!validateForm()) {
      return;
    }

    try {
      await register(formData);
      // Navigation will be handled by parent component
    } catch (err) {
      // Error is handled in the store
    }
  };

  const passwordStrength = formData.password
    ? getPasswordStrength(formData.password)
    : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address *
        </label>
        <div className="mt-1 relative">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              touched.email && errors.email
                ? 'border-red-300'
                : emailAvailable === true
                ? 'border-green-300'
                : 'border-gray-300'
            }`}
            placeholder="doctor@example.com"
          />
          {checkingEmail && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
          {emailAvailable === true && !checkingEmail && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-500">
              ✓
            </div>
          )}
        </div>
        {touched.email && errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone Number *
        </label>
        <div className="mt-1 relative">
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={10}
            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              touched.phone && errors.phone
                ? 'border-red-300'
                : phoneAvailable === true
                ? 'border-green-300'
                : 'border-gray-300'
            }`}
            placeholder="9876543210"
          />
          {checkingPhone && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
          {phoneAvailable === true && !checkingPhone && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-500">
              ✓
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500">Enter 10-digit phone number without +91</p>
        {touched.phone && errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password *
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              touched.password && errors.password ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        </div>
        {formData.password && passwordStrength && (
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    passwordStrength.strength === 'weak'
                      ? 'bg-red-500 w-1/3'
                      : passwordStrength.strength === 'medium'
                      ? 'bg-yellow-500 w-2/3'
                      : 'bg-green-500 w-full'
                  }`}
                ></div>
              </div>
              <span
                className={`text-xs font-medium ${
                  passwordStrength.strength === 'weak'
                    ? 'text-red-600'
                    : passwordStrength.strength === 'medium'
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}
              >
                {passwordStrength.strength}
              </span>
            </div>
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          At least 8 characters, 1 uppercase, 1 number
        </p>
        {touched.password && errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700"
        >
          Confirm Password *
        </label>
        <div className="mt-1">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              touched.confirmPassword && errors.confirmPassword
                ? 'border-red-300'
                : 'border-gray-300'
            }`}
          />
        </div>
        {touched.confirmPassword && errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div>
        <div className="flex items-start">
          <input
            id="termsAccepted"
            name="termsAccepted"
            type="checkbox"
            checked={formData.termsAccepted}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
              touched.termsAccepted && errors.termsAccepted ? 'border-red-300' : ''
            }`}
          />
          <label htmlFor="termsAccepted" className="ml-2 block text-sm text-gray-900">
            I accept the{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-500">
              Terms and Conditions
            </a>{' '}
            *
          </label>
        </div>
        {touched.termsAccepted && errors.termsAccepted && (
          <p className="mt-1 text-sm text-red-600">{errors.termsAccepted}</p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Creating Account...
            </div>
          ) : (
            'Create Account'
          )}
        </button>
      </div>
    </form>
  );
};
