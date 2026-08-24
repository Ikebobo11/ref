/**
 * LETCON - Admin to SuperAdmin Chat Page
 * Admins can chat with superadmin for complex issues.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaCommentDots, FaUserShield } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { sendDirectMessage, sendMessageWithFile, markConversationRead, getConversationId } from '../../services/messageService';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import ChatThread from '../../components/chat/ChatThread';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';

export default function SuperAdminChat() {
  const { user, userData } = useAuth();
  const [selectedConv, setSelectedConv] = useState(null);
  const [sending, setSending] = useState(false);

  const { data: superAdmins, loading } = useFirestoreQuery('users', {
    filters: [{ field: 'role', operator: '==', value: 'super_admin' }],
    limitCount: 10,
  });

  const handleSend = async (content, attachment) => {
    if (!selectedConv) {
