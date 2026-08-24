/**
 * LETCON - Withdrawals Page (Super Admin)
 * View and manage all withdrawal requests with bank details.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaArrowUpRightDots, FaCheck, FaXmark, FaClock } from 'react-icons/fa6';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { updateDocument } from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import { formatNaira, formatDateTime } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
