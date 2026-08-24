/**
 * LETCON - Error Handling Utilities
 * Standardized error messages and Firebase error mapping.
 */

/**
 * Maps Firebase Auth error codes to user-friendly messages.
 * @param {Object} error - The Firebase error object.
 * @returns {string} User-friendly error message.
 */
export function getAuthErrorMessage(error) {
  const code = error?.code || '';
  const messages = {
