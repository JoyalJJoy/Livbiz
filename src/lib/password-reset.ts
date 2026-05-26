import { createHash, randomBytes } from 'crypto';

const PASSWORD_RESET_IDENTIFIER_PREFIX = 'password-reset:';

export const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export function createPasswordResetToken() {
  return randomBytes(32).toString('base64url');
}

export function hashPasswordResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function getPasswordResetIdentifier(email: string) {
  return `${PASSWORD_RESET_IDENTIFIER_PREFIX}${email}`;
}

export function getEmailFromPasswordResetIdentifier(identifier: string) {
  if (!identifier.startsWith(PASSWORD_RESET_IDENTIFIER_PREFIX)) {
    return null;
  }

  return identifier.slice(PASSWORD_RESET_IDENTIFIER_PREFIX.length);
}
