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
    setSending(true);
    try {
      const { getDocument } = await import('../../services/firestoreService');
      const conv = await getDocument('conversations', selectedConv);
      const recipientId = (conv.participants || []).find((p) => p !== user.uid);
      const recipientName = conv.participantNames?.[recipientId] || 'Admin';

      if (attachment) {
        await sendMessageWithFile({
          file: attachment,
          senderId: user.uid,
          senderName: userData?.fullName || 'Super Admin',
          senderRole: userData?.role || 'super_admin',
          recipientId,
          recipientName,
          content,
        });
      } else {
        await sendDirectMessage({
          senderId: user.uid,
          senderName: userData?.fullName || 'Super Admin',
          senderRole: userData?.role || 'super_admin',
          recipientId,
          recipientName,
          content,
        });
      }
      toast.success('Message sent');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  const startChat = (admin) => {
    const convId = getConversationId(user.uid, admin.uid || admin.id);
    setSelectedConv(convId);
    markConversationRead(convId, user.uid).catch(() => {});
  };

  if (loading) return <Spinner label="Loading admins..." />;

  return (
    <div className="dashboard-page">
      <PageHeader title="Admin Chat" subtitle="Chat with admins for complex issues" icon={<FaUserShield />} />
      <div className="chat-layout">
        <Card className="chat-sidebar">
          <CardHeader><CardTitle>Admins</CardTitle></CardHeader>
          <CardBody>
            {admins.length === 0 ? (
              <EmptyState icon={<FaUserShield />} title="No admins found" />
            ) : (
              <div className="conversation-list">
                {admins.map((admin) => (
                  <button
                    key={admin.uid || admin.id}
                    type="button"
                    className={`conversation-item ${selectedConv === getConversationId(user.uid, admin.uid || admin.id) ? 'active' : ''}`}
                    onClick={() => startChat(admin)}
                  >
                    <div className="conversation-item-avatar">{admin.fullName?.charAt(0) || 'A'}</div>
                    <div className="conversation-item-info">
                      <span className="conversation-item-name">{admin.fullName || 'Admin'}</span>
                      <span className="conversation-item-preview">Admin</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
        <Card className="chat-main">
          <CardHeader>
            <CardTitle>{selectedConv ? 'Conversation' : 'Select an admin to chat'}</CardTitle>
          </CardHeader>
          <CardBody className="chat-main-body">
            {!selectedConv ? (
