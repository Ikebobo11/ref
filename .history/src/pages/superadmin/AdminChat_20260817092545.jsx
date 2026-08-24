/**
 * LETCON - SuperAdmin Admin Chat Page
 * Superadmin can chat with admins for complex issues.
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

export default function AdminChat() {
  const { user, userData } = useAuth();
  const [selectedConv, setSelectedConv] = useState(null);
  const [sending, setSending] = useState(false);

  const { data: admins, loading } = useFirestoreQuery('users', {
    filters: [{ field: 'role', operator: '==', value: 'admin' }],
    limitCount: 50,
  });

  const handleSend = async (content, attachment) => {
    if (!selectedConv) {
      toast.error('Select a conversation first');
      return;
    }
