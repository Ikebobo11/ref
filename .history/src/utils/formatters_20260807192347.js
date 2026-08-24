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
 * @returns {string} Compact follower string.
 */
export function formatFollowers(count) {
  if (count === null || count === undefined || isNaN(count)) return '0';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K`;
  return String(count);
}

/**
 * Formats a date as a readable string.
 * @param {Date|string|number} date - The date to format.
 * @returns {string} Formatted date string.
 */
export function formatDate(date) {
  if (!date) return 'N/A';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
