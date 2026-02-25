import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidPassword, isStrongPassword } from './security';

describe('Security Utils', () => {
  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('test')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@example')).toBe(false); // missing TLD
      expect(isValidEmail('test example.com')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should return true for passwords >= 6 chars', () => {
      expect(isValidPassword('123456')).toBe(true);
      expect(isValidPassword('password')).toBe(true);
      expect(isValidPassword('longerpassword123')).toBe(true);
    });

    it('should return false for passwords < 6 chars', () => {
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword('1')).toBe(false);
      expect(isValidPassword('12345')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('should return valid for strong passwords', () => {
      expect(isStrongPassword('StrongPass1').valid).toBe(true);
      expect(isStrongPassword('Ano7herOne').valid).toBe(true);
    });

    it('should return invalid for weak passwords', () => {
      expect(isStrongPassword('weak').valid).toBe(false); // too short
      expect(isStrongPassword('no_uppercase_1').valid).toBe(false);
      expect(isStrongPassword('NO_LOWERCASE_1').valid).toBe(false);
      expect(isStrongPassword('NoNumberHere').valid).toBe(false);
    });

    it('should return correct error messages', () => {
      expect(isStrongPassword('short').message).toContain('8 caracteres');
      expect(isStrongPassword('no_upper_1').message).toContain('letra mayúscula');
      expect(isStrongPassword('NO_LOWER_1').message).toContain('letra minúscula');
      expect(isStrongPassword('NoNumber').message).toContain('número');
    });
  });
});
