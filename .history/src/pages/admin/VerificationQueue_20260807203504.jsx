/**
 * LETCON - Verification Queue Page
 * Admin reviews earner verification requests and follower proof.
 * Rejects fake/bought/bot followers. Fee is non-refundable.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaUserShield, FaCircleCheck, FaCircleXmark, FaExternalLink } from 'react-icons/fa6';
