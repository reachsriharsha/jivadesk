/**
 * Authentication state management store
 */

import { create } from 'zustand';
import { authApi } from '../services/auth';
import type { User, RegisterFormData } from '../types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  register: (data: RegisterFormData) => Promise<void>;
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
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register({
        email: data.email,
        phone: data.phone,
        password: data.password,
        confirm_password: data.confirmPassword,
        terms_accepted: data.termsAccepted,
      });

      set({
        user: response.data.user,
        accessToken: response.data.token.access_token,
        refreshToken: response.data.token.refresh_token,
      });

      // Store tokens in localStorage
      localStorage.setItem('access_token', response.data.token.access_token);
      localStorage.setItem('refresh_token', response.data.token.refresh_token);
    } catch (error: any) {
      const errorMessage =
        error.message || error.response?.data?.message || 'Registration failed';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  checkEmailAvailable: async (email: string) => {
    try {
      const response = await authApi.checkEmail(email);
      return response.data.available;
    } catch (error) {
      return false;
    }
  },

  checkPhoneAvailable: async (phone: string) => {
    try {
      const response = await authApi.checkPhone(phone);
      return response.data.available;
    } catch (error) {
      return false;
    }
  },

  logout: () => {
    set({ user: null, accessToken: null, refreshToken: null });
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  clearError: () => set({ error: null }),

  setError: (error: string) => set({ error }),
}));
