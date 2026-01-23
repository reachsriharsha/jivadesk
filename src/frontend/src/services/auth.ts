/**
 * Authentication API service
 */

import type {
  RegisterRequest,
  RegisterResponse,
  CheckAvailabilityResponse,
  CheckEmailRequest,
  CheckPhoneRequest,
} from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class AuthApiService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }

  /**
   * Check if email is available (POST)
   */
  async checkEmail(email: string): Promise<CheckAvailabilityResponse> {
    const body: CheckEmailRequest = { email };
    const response = await fetch(`${API_BASE_URL}/auth/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to check email availability');
    }

    return response.json();
  }

  /**
   * Check if phone is available (POST)
   */
  async checkPhone(phone: string): Promise<CheckAvailabilityResponse> {
    const body: CheckPhoneRequest = { phone };
    const response = await fetch(`${API_BASE_URL}/auth/check-phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to check phone availability');
    }

    return response.json();
  }
}

export const authApi = new AuthApiService();
