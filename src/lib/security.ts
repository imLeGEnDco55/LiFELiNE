export function isValidEmail(email: string): boolean {
  // Simple but effective regex for email validation
  // Checks for chars@chars.chars
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  // Supabase default is 6 characters
  return password.length >= 6;
}

export function isStrongPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'La contraseña debe incluir al menos una mayúscula.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'La contraseña debe incluir al menos una minúscula.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'La contraseña debe incluir al menos un número.' };
  }
  return { valid: true };
}
