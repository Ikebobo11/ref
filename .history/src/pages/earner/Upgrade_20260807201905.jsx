/**
 * LETCON - Upgrade Page
 * Request a tier upgrade (follower-count tier only, separate from Account Change Request).
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FaArrowUpRightDots, FaUsers, FaLink, FaImage } from 'react-icons/fa6';
import { upgradeSchema } from '../../utils/validators';
