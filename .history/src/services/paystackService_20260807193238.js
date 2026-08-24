/**
 * LETCON - Paystack Service
 * Handles payment initialization, verification, and webhook processing.
 */
import axios from 'axios';
import { PAYSTACK_PUBLIC_KEY, isPaystackConfigured, generateReference } from '../config/paystack';
import { FEES, COLLECTIONS } from '../config/constants';
import { addDocument, updateDocument, getDocument } from './firestoreService';

/** Paystack API base URL */
const PAYSTACK_API_URL = 'https://api.paystack.co';

/**
 * Initializes a Paystack payment.
