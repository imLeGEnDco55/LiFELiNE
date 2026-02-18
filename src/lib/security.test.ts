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
    it('should return true for strong passwords', () => {
      expect(isStrongPassword('StrongPass1')).toBe(true);
      expect(isStrongPassword('Another1Strong')).toBe(true);
      expect(isStrongPassword('123abcABC')).toBe(true);
    });

    it('should return false for weak passwords', () => {
      expect(isStrongPassword('weak')).toBe(false); // too short
      expect(isStrongPassword('alllowercase1')).toBe(false); // missing uppercase
      expect(isStrongPassword('ALLUPPERCASE1')).toBe(false); // missing lowercase
      expect(isStrongPassword('NoNumberCase')).toBe(false); // missing number
      expect(isStrongPassword('12345678')).toBe(false); // missing letters
      expect(isStrongPassword('Short1A')).toBe(false); // too short but has complexity
    });
  });
});
