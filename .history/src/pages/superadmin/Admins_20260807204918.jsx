/**
 * LETCON - Admins Page
 * Super admin manages admin accounts: invite and remove admins.
 * Super Admin cannot be removed by any other account.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FaUserShield, FaUserPlus, FaTrash, FaEnvelope, FaUser } from 'react-icons/fa6';
import { adminInviteSchema } from '../../utils/validators';
