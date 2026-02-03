import { describe, it, expect } from "vitest";
import { validateEmail, validatePassword } from "./security";

describe("Security Validation", () => {
  describe("validateEmail", () => {
    it("should accept valid emails", () => {
      expect(validateEmail("test@example.com").success).toBe(true);
      expect(validateEmail("user.name+tag@sub.domain.org").success).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(validateEmail("invalid-email").success).toBe(false);
      expect(validateEmail("missing@domain").success).toBe(false); // zod default email validation might accept this depending on version, let's verify
      expect(validateEmail("@missinguser.com").success).toBe(false);
      expect(validateEmail("").success).toBe(false);
    });

    it("should return correct error message", () => {
      const result = validateEmail("not-an-email");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Formato de email inválido");
    });
  });

  describe("validatePassword", () => {
    it("should accept passwords with 6 or more characters", () => {
      expect(validatePassword("123456").success).toBe(true);
      expect(validatePassword("password123").success).toBe(true);
    });

    it("should reject passwords shorter than 6 characters", () => {
      expect(validatePassword("12345").success).toBe(false);
      expect(validatePassword("").success).toBe(false);
    });

    it("should return correct error message", () => {
      const result = validatePassword("123");
      expect(result.success).toBe(false);
      expect(result.error).toBe("La contraseña debe tener al menos 6 caracteres");
    });
  });
});
