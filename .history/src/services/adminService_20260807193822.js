/**
 * LETCON - Admin Service
 * Handles admin operations: user management, verification, upgrades, and account changes.
 */
import {
  getDocument,
  updateDocument,
  addDocument,
  queryDocuments,
  executeBatch,
} from './firestoreService';
import { COLLECTIONS, VERIFICATION_STATUS, UPGRADE_STATUS, ACCOUNT_CHANGE_STATUS, ROLES } from '../config/constants';
import { getTierFromFollowers } from '../utils/tierLogic';
import {
