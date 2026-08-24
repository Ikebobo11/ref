/**
 * LETCON - Earner Registration Page
 * Registration with Verified Promotion Account setup and verification fee payment.
 * Registration and verified-account setup happen together - no separate general registration.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaRightToBracket,
  FaHashtag,
  FaLink,
  FaUsers,
  FaImage,
  FaCreditCard,
} from 'react-icons/fa6';
import { earnerRegisterSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES, PLATFORM_LIST, FEES, CURRENCY_SYMBOL } from '../../config/constants';
import { uploadVerificationProof } from '../../services/storageService';
import { recordVerificationFeePayment } from '../../services/paystackService';
import { generateReference } from '../../config/paystack';
import { addDocument } from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import FileUpload from '../../components/ui/FileUpload';
import Logo from '../../components/shared/Logo';
import PlatformBadge from '../../components/shared/PlatformBadge';

const PLATFORM_OPTIONS = PLATFORM_LIST.map((platform) => ({ value: platform, label: platform }));

/**
 * Earner registration page component.
 */
export default function EarnerRegister() {
  const { register: registerUser, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [followerScreenshot, setFollowerScreenshot] = useState(null);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(earnerRegisterSchema),
    defaultValues: {
      platform: '',
      platformName: '',
      username: '',
      profileUrl: '',
      followerCount: '',
    },
  });

  const selectedPlatform = watch('platform');

  /**
   * Handles form submission - creates account, uploads proof, and initiates verification fee payment.
   * @param {Object} data - Form data.
   */
  const onSubmit = async (data) => {
    setLoading(true);
    try {
