/**
 * LETCON - Verification Payment Page
 * Handles the ₦1,000 non-refundable verification fee payment via Paystack.
 */
import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaCreditCard, FaShieldHalved, FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import { FEES, CURRENCY_SYMBOL } from '../../config/constants';
import { createCheckoutHandler } from '../../services/paystackService';
import { updateDocument, getDocument } from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import Button from '../../components/ui/Button';
import Logo from '../../components/shared/Logo';

/**
 * Verification payment page component.
 */
export default function VerificationPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);


