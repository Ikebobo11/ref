/**
 * LETCON - Advertiser Registration Page
 * Registration for businesses, artists, brands, record labels, and agencies.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaUser, FaPhone, FaBuilding, FaRightToBracket } from 'react-icons/fa6';
import { advertiserRegisterSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../config/constants';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Logo from '../../components/shared/Logo';

const ACCOUNT_TYPES = [
  { value: 'Business', label: 'Business' },
  { value: 'Artist', label: 'Artist' },
  { value: 'Brand', label: 'Brand' },
  { value: 'Record Label', label: 'Record Label' },
  { value: 'Agency', label: 'Agency' },
];

/**
 * Advertiser registration page component.
 */
export default function AdvertiserRegister() {
