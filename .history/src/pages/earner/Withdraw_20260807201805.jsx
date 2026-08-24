/**
 * LETCON - Withdraw Page
 * Instant withdrawal with no admin approval required.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FaArrowUpRightDots, FaBuildingColumn, FaHashtag, FaUser } from 'react-icons/fa6';
import { withdrawalSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';
import { createWithdrawal } from '../../services/walletService';
import { formatNaira } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
