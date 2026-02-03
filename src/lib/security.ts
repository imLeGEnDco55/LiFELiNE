import { z } from "zod";

export const emailSchema = z.string().email("Formato de email inválido");
export const passwordSchema = z.string().min(6, "La contraseña debe tener al menos 6 caracteres");

export function validateEmail(email: string): { success: boolean; error?: string } {
  const result = emailSchema.safeParse(email);
  if (result.success) {
    return { success: true };
  }
  return { success: false, error: result.error.errors[0].message };
}

export function validatePassword(password: string): { success: boolean; error?: string } {
  const result = passwordSchema.safeParse(password);
  if (result.success) {
    return { success: true };
  }
  return { success: false, error: result.error.errors[0].message };
}
