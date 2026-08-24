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
  if (amount === null || amount === undefined || isNaN(amount)) return `${CURRENCY_SYMBOL}0`;
  return `${CURRENCY_SYMBOL}${Number(amount).toLocaleString('en-NG')}`;
}

/**
 * Formats a number with thousands separators.
 * @param {number} value - The number to format.
 * @returns {string} Formatted number string.
 */
export function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return Number(value).toLocaleString('en-NG');
}

/**
 * Formats a follower count in compact form (e.g., 5K, 10K, 15K).
 * @param {number} count - The follower count.
