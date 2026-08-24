/**
 * LETCON - Settings Service
 * Loads platform settings from Firestore with fallback to constants defaults.
 * Provides getSettings() and getSetting() for app-wide configuration.
 */
import { getDocument, setDocument } from './firestoreService';
import { COLLECTIONS } from '../config/constants';
import {
  PLATFORMS,
  PLATFORM_LIST,
  TIERS,
  TIER_LIST,
  TIER_MIN_FOLLOWERS,
  TIER_PAYMENTS,
  REVENUE_SPLIT,
  FEES,
  AUTO_APPROVAL_HOURS,
  CURRENCY,
  CURRENCY_SYMBOL,
  APP_NAME,
  APP_TAGLINE,
  COUNTRIES,
  UPLOAD_LIMITS,
