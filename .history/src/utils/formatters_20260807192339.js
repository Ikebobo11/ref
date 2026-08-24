/**
 * LETCON - Formatting Utilities
 * Helpers for currency, numbers, dates, and display formatting.
 */
import { CURRENCY_SYMBOL } from '../config/constants';

/**
 * Formats a number as Nigerian Naira currency.
 * @param {number} amount - The amount to format.
 * @returns {string} Formatted currency string (e.g., "₦12,000").
 */
export function formatNaira(amount) {
