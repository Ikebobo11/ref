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
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'The email address is not valid.',
    'auth/user-disabled': 'This account has been disabled. Contact support.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
    'auth/weak-password': 'Password is too weak. Use at least 8 characters.',
    'auth/operation-not-allowed': 'This operation is not allowed.',
    'auth/requires-recent-login': 'Please log in again to continue.',
    'auth/invalid-verification-code': 'Invalid verification code.',
    'auth/invalid-verification-id': 'Invalid verification ID.',
  };
