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
