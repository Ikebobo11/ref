/**
 * LETCON - Messages Page
 * Messaging interface for the earner.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaPaperPlane, FaCommentDots } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { addDocument } from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import { formatRelativeTime } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';

/**
 * Messages page component.
 */
export default function Messages() {
