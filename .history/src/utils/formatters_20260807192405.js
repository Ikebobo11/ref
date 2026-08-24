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
  return d.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a date and time as a readable string.
 * @param {Date|string|number} date - The date to format.
 * @returns {string} Formatted date-time string.
 */
export function formatDateTime(date) {
  if (!date) return 'N/A';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats a date as a relative time string (e.g., "2 hours ago").
 * @param {Date|string|number} date - The date to format.
 * @returns {string} Relative time string.
 */
export function formatRelativeTime(date) {
  if (!date) return 'N/A';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return 'N/A';

  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  return 'just now';
}

/**
 * Formats a percentage.
 * @param {number} value - The percentage value.
 * @param {number} [decimals=0] - Number of decimal places.
 * @returns {string} Formatted percentage string.
 */
export function formatPercent(value, decimals = 0) {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Truncates a string to a maximum length with ellipsis.
 * @param {string} str - The string to truncate.
 * @param {number} [maxLength=50] - Maximum length.
 * @returns {string} Truncated string.
 */
export function truncate(str, maxLength = 50) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
}

/**
 * Capitalizes the first letter of each word.
 * @param {string} str - The string to capitalize.
 * @returns {string} Capitalized string.
 */
export function capitalize(str) {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Converts a string to title case.
 * @param {string} str - The string to convert.
 * @returns {string} Title-cased string.
 */
export function titleCase(str) {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Formats a Firestore timestamp.
 * @param {Object} timestamp - Firestore timestamp object.
 * @returns {string} Formatted date string.
 */
export function formatFirestoreTimestamp(timestamp) {
