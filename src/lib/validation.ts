export function normalizeEmail(email: unknown) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function normalizeIndianPhone(phone: unknown) {
  if (typeof phone !== 'string') return '';

  const digits = phone.replace(/\D/g, '');
  if (digits.length > 10 && digits.startsWith('91')) {
    return digits.slice(2);
  }

  return digits;
}

export function validatePasswordStrength(password: unknown) {
  if (typeof password !== 'string') {
    return 'Password is required.';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Password must include at least one letter and one number.';
  }

  return null;
}
