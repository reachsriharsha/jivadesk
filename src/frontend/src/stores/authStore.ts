/**
 * Authentication state management store
 */

import { create } from 'zustand';
import { authApi } from '../services/auth';
import { logger } from '../utils/logger';
import type { User, RegisterFormData, LoginFormData, ProfileSetupFormData } from '../types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  register: (data: RegisterFormData) => Promise<void>;
  login: (data: LoginFormData) => Promise<void>;
  setupProfile: (data: ProfileSetupFormData) => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  checkEmailAvailable: (email: string) => Promise<boolean>;
  checkPhoneAvailable: (phone: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  setError: (error: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,

  register: async (data: RegisterFormData) => {
    logger.info('registration_started', { email: data.email, phone: data.phone });
    set({ isLoading: true, error: null });

    try {
      const response = await authApi.register({
        email: data.email,
        phone: data.phone,
        password: data.password,
        confirm_password: data.confirmPassword,
        terms_accepted: data.termsAccepted,
      });

      const userId = response.data.user.id;

      set({
        user: response.data.user,
        accessToken: response.data.token.access_token,
        refreshToken: response.data.token.refresh_token,
      });

      // Store tokens in localStorage
      localStorage.setItem('access_token', response.data.token.access_token);
      localStorage.setItem('refresh_token', response.data.token.refresh_token);

      logger.info('registration_success', {
        userId,
        email: data.email,
        tokenStored: true,
      });
    } catch (error: any) {
      const errorMessage =
        error.detail?.message || error.message || 'Registration failed';
      const errorCode = error.detail?.error_code || error.error_code || 'UNKNOWN';

      logger.error('registration_failed', {
        email: data.email,
        errorCode,
        errorMessage,
      });

      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (data: LoginFormData) => {
    logger.info('login_started', { email: data.email });
    set({ isLoading: true, error: null });

    try {
      const response = await authApi.login({
        email: data.email,
        password: data.password,
      });

      const userId = response.data.user.id;
      const isProfileComplete = response.data.user.is_profile_complete;

      set({
        user: response.data.user,
        accessToken: response.data.token.access_token,
        refreshToken: response.data.token.refresh_token,
      });

      // Store tokens in localStorage
      localStorage.setItem('access_token', response.data.token.access_token);
      localStorage.setItem('refresh_token', response.data.token.refresh_token);

      logger.info('login_success', {
        userId,
        email: data.email,
        isProfileComplete,
        tokenStored: true,
      });
    } catch (error: any) {
      const errorMessage =
        error.detail?.message || error.message || 'Login failed';
      const errorCode = error.detail?.error_code || error.error_code || 'UNKNOWN';

      logger.error('login_failed', {
        email: data.email,
        errorCode,
        errorMessage,
      });

      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setupProfile: async (data: ProfileSetupFormData) => {
    logger.info('profile_setup_started', {
      fullName: data.fullName,
      registrationNumber: data.medicalRegistrationNumber,
    });
    set({ isLoading: true, error: null });

    try {
      const response = await authApi.setupProfile({
        full_name: data.fullName,
        medical_registration_number: data.medicalRegistrationNumber,
        qualification: data.qualification,
        specialization: data.specialization,
      });

      const userId = response.data.user.id;

      set({ user: response.data.user });

      logger.info('profile_setup_success', {
        userId,
        fullName: data.fullName,
        isProfileComplete: response.data.user.is_profile_complete,
      });
    } catch (error: any) {
      const errorMessage =
        error.detail?.message || error.message || 'Profile setup failed';
      const errorCode = error.detail?.error_code || error.error_code || 'UNKNOWN';

      logger.error('profile_setup_failed', {
        errorCode,
        errorMessage,
      });

      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCurrentUser: async () => {
    logger.debug('fetch_current_user_started', {});

    try {
      const response = await authApi.getCurrentUser();
      set({ user: response.data.user });

      logger.debug('fetch_current_user_success', {
        userId: response.data.user.id,
        isProfileComplete: response.data.user.is_profile_complete,
      });
    } catch (error: any) {
      logger.error('fetch_current_user_failed', {
        errorMessage: error.message,
      });
      // If token is invalid, clear auth state
      if (error.status === 401 || error.detail?.error_code === 'UNAUTHORIZED') {
        const { logout } = useAuthStore.getState();
        logout();
      }
    }
  },

  checkEmailAvailable: async (email: string) => {
    try {
      const response = await authApi.checkEmail(email);
      logger.debug('email_availability_checked', {
        email,
        available: response.data.available,
      });
      return response.data.available;
    } catch (error: any) {
      logger.warn('email_availability_check_failed', {
        email,
        errorMessage: error.message,
      });
      return false;
    }
  },

  checkPhoneAvailable: async (phone: string) => {
    try {
      const response = await authApi.checkPhone(phone);
      logger.debug('phone_availability_checked', {
        phone,
        available: response.data.available,
      });
      return response.data.available;
    } catch (error: any) {
      logger.warn('phone_availability_check_failed', {
        phone,
        errorMessage: error.message,
      });
      return false;
    }
  },

  logout: async () => {
    const currentUser = get().user;
    const userId = currentUser?.id;

    logger.info('logout_started', { userId: userId || 'unknown' });

    try {
      // Call backend logout endpoint (best effort - don't block on failure)
      await authApi.logout();
      logger.info('backend_logout_success', { userId: userId || 'unknown' });
    } catch (error: any) {
      // Log error but continue with client-side cleanup
      logger.warn('backend_logout_failed', {
        userId: userId || 'unknown',
        errorMessage: error.message || 'Unknown error',
        note: 'Continuing with client-side cleanup'
      });
    }

    // Always clear client-side state regardless of backend result
    set({ user: null, accessToken: null, refreshToken: null });
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    logger.info('logout_complete', {
      userId: userId || 'unknown',
      tokensCleared: true,
    });
  },

  clearError: () => set({ error: null }),

  setError: (error: string) => {
    logger.warn('error_set_manually', { errorMessage: error });
    set({ error });
  },
}));
