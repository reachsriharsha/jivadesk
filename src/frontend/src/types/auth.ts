/**
 * Authentication type definitions
 */

export interface RegisterRequest {
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  terms_accepted: boolean;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  is_profile_complete: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RegisterResponse {
  status: string;
  message: string;
  data: {
    user: User;
    token: TokenResponse;
  };
}

export interface CheckAvailabilityResponse {
  status: string;
  data: {
    available: boolean;
  };
}

export interface ErrorResponse {
  status: string;
  message: string;
  error_code?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface RegisterFormData {
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

export interface ValidationErrors {
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  termsAccepted?: string;
}

export interface CheckEmailRequest {
  email: string;
}

export interface CheckPhoneRequest {
  phone: string;
}
