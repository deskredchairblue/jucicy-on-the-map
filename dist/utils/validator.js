"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEmail = isValidEmail;
exports.isValidPassword = isValidPassword;
exports.validateLoginInput = validateLoginInput;
const validator_1 = __importDefault(require("validator"));
/**
 * Validate if a string is a valid email.
 * @param email - The email to validate.
 * @returns True if valid, false otherwise.
 */
function isValidEmail(email) {
    return validator_1.default.isEmail(email);
}
/**
 * Validate if a password meets basic security criteria:
 * - Minimum 8 characters
 * - Contains at least one uppercase letter, one lowercase letter, and one digit.
 * @param password - The password to validate.
 * @returns True if valid, false otherwise.
 */
function isValidPassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
}
/**
 * Validate login inputs for email and password.
 * @param email - Email input.
 * @param password - Password input.
 * @returns An array of error messages. Empty array means validation passed.
 */
function validateLoginInput(email, password) {
    const errors = [];
    if (!email || !isValidEmail(email)) {
        errors.push('Invalid email format.');
    }
    if (!password || !isValidPassword(password)) {
        errors.push('Password must be at least 8 characters long and include uppercase, lowercase, and a number.');
    }
    return errors;
}
//# sourceMappingURL=validator.js.map