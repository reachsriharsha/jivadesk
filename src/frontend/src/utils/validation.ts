/**
 * Validation rules and utilities
 */

export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email format',
  },
  phone: {
    pattern: /^[0-9]{10}$/,
    message: 'Phone must be 10 digits',
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireNumber: true,
    message: 'Password must be at least 8 characters with 1 uppercase and 1 number',
  },
};

export const validateEmail = (email: string): string | undefined => {
  if (!email) {
    return 'Email is required';
  }
  if (!VALIDATION_RULES.email.pattern.test(email)) {
    return VALIDATION_RULES.email.message;
  }
  return undefined;
};

export const validatePhone = (phone: string): string | undefined => {
  if (!phone) {
    return 'Phone is required';
  }
  if (!VALIDATION_RULES.phone.pattern.test(phone)) {
    return VALIDATION_RULES.phone.message;
  }
  return undefined;
};

export const validatePassword = (password: string): string | undefined => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < VALIDATION_RULES.password.minLength) {
    return `Password must be at least ${VALIDATION_RULES.password.minLength} characters`;
  }
  if (VALIDATION_RULES.password.requireUppercase && !/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (VALIDATION_RULES.password.requireNumber && !/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return undefined;
};

export const getPasswordStrength = (password: string): {
  strength: 'weak' | 'medium' | 'strong';
  score: number;
} => {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { strength: 'weak', score };
  if (score <= 4) return { strength: 'medium', score };
  return { strength: 'strong', score };
};
