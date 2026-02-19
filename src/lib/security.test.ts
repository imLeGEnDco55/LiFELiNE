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
    it('should validate strong passwords', () => {
      const result = isStrongPassword('StrongPass1');
      expect(result.valid).toBe(true);
    });

    it('should reject short passwords', () => {
      const result = isStrongPassword('Pass1');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('8 caracteres');
    });

    it('should reject passwords without uppercase', () => {
      const result = isStrongPassword('password123');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('mayúscula');
    });

    it('should reject passwords without lowercase', () => {
      const result = isStrongPassword('PASSWORD123');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('minúscula');
    });

    it('should reject passwords without numbers', () => {
      const result = isStrongPassword('StrongPass');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('número');
    });
  });
});
