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

export function isStrongPassword(password: string): boolean {
  // Min 8 chars, 1 uppercase, 1 lowercase, 1 number
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return password.length >= 8 && hasUpperCase && hasLowerCase && hasNumber;
}
