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
      expect(isStrongPassword('Another1GoodOne').valid).toBe(true);
    });

    it('should fail for passwords shorter than 8 chars', () => {
      const result = isStrongPassword('Pass1');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('8 caracteres');
    });

    it('should fail for passwords without uppercase', () => {
      const result = isStrongPassword('weakpass1');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('mayúscula');
    });

    it('should fail for passwords without lowercase', () => {
      const result = isStrongPassword('WEAKPASS1');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('minúscula');
    });

    it('should fail for passwords without number', () => {
      const result = isStrongPassword('WeakPass');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('número');
    });
  });
});
