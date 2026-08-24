/**
 * LETCON - Flagged Mismatches Page
 * Admin reviews task submissions flagged for verified account mismatch.
 * These are excluded from auto-approval and must go through admin review.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaTriangleExclamation, FaCircleCheck, FaCircleXmark, FaExternalLink } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
