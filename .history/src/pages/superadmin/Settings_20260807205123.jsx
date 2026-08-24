/**
 * LETCON - Settings Page
 * Super admin manages platform settings, pricing, and payment gateway.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FaGear, FaCreditCard, FaWallet, FaPercent } from 'react-icons/fa6';
import { settingsSchema } from '../../utils/validators';
