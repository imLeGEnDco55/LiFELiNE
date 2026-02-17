import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidPassword } from './security';

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
    it('should require at least 8 characters', () => {
      expect(isValidPassword('Pass123')).toBe(false); // 7 chars
      expect(isValidPassword('Password123')).toBe(true); // > 8 chars
    });

    it('should require at least one uppercase letter', () => {
      expect(isValidPassword('password123')).toBe(false);
      expect(isValidPassword('Password123')).toBe(true);
    });

    it('should require at least one lowercase letter', () => {
      expect(isValidPassword('PASSWORD123')).toBe(false);
      expect(isValidPassword('Password123')).toBe(true);
    });

    it('should require at least one number', () => {
      expect(isValidPassword('Password')).toBe(false);
      expect(isValidPassword('Password123')).toBe(true);
    });

    it('should allow special characters', () => {
      expect(isValidPassword('P@ssw0rd!')).toBe(true);
    });
  });
});
