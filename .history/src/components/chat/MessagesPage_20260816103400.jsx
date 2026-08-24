/**
 * LETCON - MessagesPage Component
 * Reusable conversation-based messaging UI with file attachments.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaCommentDots } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import {
  sendDirectMessage,
  sendMessageWithFile,
  markConversationRead,
} from '../../services/messageService';
import PageHeader from '../ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../ui/Card';
import ConversationList from './ConversationList';
import ChatThread from './ChatThread';
import EmptyState from '../ui/EmptyState';

export default function MessagesPage({ subtitle = 'Chat with LETCON support' }) {
  const { user, userData } = useAuth();
  const [selectedConv, setSelectedConv] = useState(null);
  const [sending, setSending] = useState(false);

  const handleSend = async (content, attachment) => {
    if (!selectedConv) {
      toast.error('Select a conversation first');
      return;
    }
    setSending(true);
    try {
