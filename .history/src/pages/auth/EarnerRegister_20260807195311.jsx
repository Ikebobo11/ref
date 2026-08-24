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
