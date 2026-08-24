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
import { approveTaskSubmission, rejectTaskSubmission } from '../../services/taskService';
import { formatRelativeTime } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

/**
 * Flagged mismatches page component.
 */
export default function FlaggedMismatches() {
  const { userData } = useAuth();
  const [processingId, setProcessingId] = useState(null);
