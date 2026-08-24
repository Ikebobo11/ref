/**
 * LETCON - Support Messages Page
 * Admin views and replies to user support messages.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaPaperPlane, FaHeadset, FaUser } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { addDocument } from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import { formatRelativeTime } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

/**
 * Support messages page component.
 */
export default function SupportMessages() {
  const { user, userData } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Get all support messages (staff can read all)
  const { data: allMessages, loading } = useFirestoreQuery(COLLECTIONS.MESSAGES, {
    orderByFields: [{ field: 'createdAt', direction: 'desc' }],
    limitCount: 100,
  });

  // Group messages by user
  const conversations = {};
  allMessages.forEach((msg) => {
    const uid = msg.uid || msg.senderId;
    if (!conversations[uid]) {
      conversations[uid] = {
        uid,
        userName: msg.senderName || 'User',
        messages: [],
        lastMessage: msg,
      };
    }
    conversations[uid].messages.push(msg);
  });

  const conversationList = Object.values(conversations).sort((a, b) => {
    const aTime = a.lastMessage.createdAt?.toDate?.() || a.lastMessage.createdAt || 0;
    const bTime = b.lastMessage.createdAt?.toDate?.() || b.lastMessage.createdAt || 0;
    return new Date(bTime) - new Date(aTime);
  });

  const selectedConversation = selectedUser
    ? conversations[selectedUser]
    : null;

  /**
   * Sends a reply to the selected user.
   */
  const handleSend = async () => {
    if (!message.trim() || !selectedUser) return;
    setSending(true);
    try {
      await addDocument(COLLECTIONS.MESSAGES, {
        uid: selectedUser,
        senderId: user.uid,
        senderName: userData?.fullName || 'Support',
        senderRole: userData?.role || 'admin',
        content: message.trim(),
        isSupportReply: true,
        createdAt: new Date(),
      });
      setMessage('');
      toast.success('Reply sent!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <Spinner label="Loading support messages..." />;
  }

  return (
