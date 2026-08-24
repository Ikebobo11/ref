/**
 * LETCON - Advertiser Wallet Page
 * Wallet funding via Paystack and transaction history.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FaWallet, FaCreditCard, FaCircleCheck, FaClock } from 'react-icons/fa6';
