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
  full_name?: string;
  medical_registration_number?: string;
  qualification?: string;
  specialization?: string;
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

// Login types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    user: User;
    token: TokenResponse;
  };
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// Profile Setup types (AUTH-003)
export interface ProfileSetupRequest {
  full_name: string;
  medical_registration_number: string;
  qualification: string;
  specialization: string;
}

export interface ProfileSetupResponse {
  status: string;
  message: string;
  data: {
    user: User;
  };
}

export interface UserProfileResponse {
  status: string;
  data: {
    user: User;
  };
}

export interface ProfileSetupFormData {
  fullName: string;
  medicalRegistrationNumber: string;
  qualification: string;
  specialization: string;
}

export interface ProfileSetupFormErrors {
  fullName?: string;
  medicalRegistrationNumber?: string;
  qualification?: string;
  specialization?: string;
  general?: string;
}

// Specialization options
export const SPECIALIZATIONS = [
  'General Physician',
  'Pediatrician',
  'Gynecologist',
  'Dermatologist',
  'Orthopedic',
  'ENT Specialist',
  'Ophthalmologist',
  'Cardiologist',
  'Neurologist',
  'Psychiatrist',
  'General Surgeon',
  'Other',
] as const;

export type Specialization = (typeof SPECIALIZATIONS)[number];
