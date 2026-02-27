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
      expect(isStrongPassword('StrongPass1')).toEqual({ valid: true });
      expect(isStrongPassword('Another1Strong')).toEqual({ valid: true });
    });

    it('should fail for passwords < 8 chars', () => {
      expect(isStrongPassword('Pass1')).toEqual({
        valid: false,
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    });

    it('should fail if missing uppercase', () => {
      expect(isStrongPassword('weakpass1')).toEqual({
        valid: false,
        message: 'La contraseña debe incluir al menos una mayúscula'
      });
    });

    it('should fail if missing lowercase', () => {
      expect(isStrongPassword('WEAKPASS1')).toEqual({
        valid: false,
        message: 'La contraseña debe incluir al menos una minúscula'
      });
    });

    it('should fail if missing number', () => {
      expect(isStrongPassword('NoNumberPass')).toEqual({
        valid: false,
        message: 'La contraseña debe incluir al menos un número'
      });
    });
  });
});
