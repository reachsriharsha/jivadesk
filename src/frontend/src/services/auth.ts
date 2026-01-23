/**
 * Authentication API service
 */

import type {
  RegisterRequest,
  RegisterResponse,
  CheckAvailabilityResponse,
  CheckEmailRequest,
  CheckPhoneRequest,
  LoginRequest,
  LoginResponse,
} from '../types/auth';
import { logger } from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class AuthApiService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const endpoint = '/auth/register';
    const startTime = Date.now();

    logger.info('api_request_start', {
      method: 'POST',
      endpoint,
      email: data.email,
      phone: data.phone,
    });

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const durationMs = Date.now() - startTime;

      if (!response.ok) {
        const error = await response.json();
        logger.error('api_request_failed', {
          method: 'POST',
          endpoint,
          status: response.status,
          durationMs,
          errorCode: error.detail?.error_code || error.error_code,
          errorMessage: error.detail?.message || error.message,
        });
        throw error;
      }

      const result = await response.json();
      logger.info('api_request_success', {
        method: 'POST',
        endpoint,
        status: response.status,
        durationMs,
        userId: result.data?.user?.id,
      });

      return result;
    } catch (error: any) {
      if (!error.detail && !error.error_code) {
        // Network error or unexpected error
        logger.error('api_request_error', {
          method: 'POST',
          endpoint,
          errorType: 'network_or_unknown',
          errorMessage: error.message || 'Unknown error',
        });
      }
      throw error;
    }
  }

  /**
   * Check if email is available (POST)
   */
  async checkEmail(email: string): Promise<CheckAvailabilityResponse> {
    const endpoint = '/auth/check-email';
    const startTime = Date.now();

    logger.debug('api_request_start', { method: 'POST', endpoint, email });

    try {
      const body: CheckEmailRequest = { email };
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const durationMs = Date.now() - startTime;

      if (!response.ok) {
        logger.error('api_request_failed', {
          method: 'POST',
          endpoint,
          status: response.status,
          durationMs,
          email,
        });
        throw new Error('Failed to check email availability');
      }

      const result = await response.json();
      logger.debug('api_request_success', {
        method: 'POST',
        endpoint,
        status: response.status,
        durationMs,
        email,
        available: result.data?.available,
      });

      return result;
    } catch (error: any) {
      logger.error('api_request_error', {
        method: 'POST',
        endpoint,
        email,
        errorMessage: error.message,
      });
      throw error;
    }
  }

  /**
   * Check if phone is available (POST)
   */
  async checkPhone(phone: string): Promise<CheckAvailabilityResponse> {
    const endpoint = '/auth/check-phone';
    const startTime = Date.now();

    logger.debug('api_request_start', { method: 'POST', endpoint, phone });

    try {
      const body: CheckPhoneRequest = { phone };
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const durationMs = Date.now() - startTime;

      if (!response.ok) {
        logger.error('api_request_failed', {
          method: 'POST',
          endpoint,
          status: response.status,
          durationMs,
          phone,
        });
        throw new Error('Failed to check phone availability');
      }

      const result = await response.json();
      logger.debug('api_request_success', {
        method: 'POST',
        endpoint,
        status: response.status,
        durationMs,
        phone,
        available: result.data?.available,
      });

      return result;
    } catch (error: any) {
      logger.error('api_request_error', {
        method: 'POST',
        endpoint,
        phone,
        errorMessage: error.message,
      });
      throw error;
    }
  }

  /**
   * Login user with email and password
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const endpoint = '/auth/login';
    const startTime = Date.now();

    logger.info('api_request_start', {
      method: 'POST',
      endpoint,
      email: data.email,
    });

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const durationMs = Date.now() - startTime;

      if (!response.ok) {
        const error = await response.json();
        logger.error('api_request_failed', {
          method: 'POST',
          endpoint,
          status: response.status,
          durationMs,
          email: data.email,
          errorCode: error.detail?.error_code || error.error_code,
          errorMessage: error.detail?.message || error.message,
        });
        throw error;
      }

      const result = await response.json();
      logger.info('api_request_success', {
        method: 'POST',
        endpoint,
        status: response.status,
        durationMs,
        userId: result.data?.user?.id,
        email: data.email,
      });

      return result;
    } catch (error: any) {
      if (!error.detail && !error.error_code) {
        logger.error('api_request_error', {
          method: 'POST',
          endpoint,
          email: data.email,
          errorType: 'network_or_unknown',
          errorMessage: error.message || 'Unknown error',
        });
      }
      throw error;
    }
  }
}

export const authApi = new AuthApiService();
