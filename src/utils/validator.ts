import validator from 'validator';

/**
 * Validate if a string is a valid email.
 * @param email - The email to validate.
 * @returns True if valid, false otherwise.
 */
export function isValidEmail(email: string): boolean {
  return validator.isEmail(email);
}

/**
 * Validate if a password meets basic security criteria:
 * - Minimum 8 characters
 * - Contains at least one uppercase letter, one lowercase letter, and one digit.
 * @param password - The password to validate.
 * @returns True if valid, false otherwise.
 */
export function isValidPassword(password: string): boolean {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Validate login inputs for email and password.
 * @param email - Email input.
 * @param password - Password input.
 * @returns An array of error messages. Empty array means validation passed.
 */
export function validateLoginInput(email: string, password: string): string[] {
  const errors: string[] = [];
  if (!email || !isValidEmail(email)) {
    errors.push('Invalid email format.');
  }
  if (!password || !isValidPassword(password)) {
    errors.push('Password must be at least 8 characters long and include uppercase, lowercase, and a number.');
  }
  return errors;
}
