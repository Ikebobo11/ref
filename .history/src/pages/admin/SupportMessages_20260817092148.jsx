/**
 * LETCON - Support Messages Page
 * Admin views and replies to user support messages.
 * Supports individual messaging, broadcast to all users, and file attachments.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaHeadset, FaUser, FaBullhorn, FaPaperPlane, FaPaperclip, FaXmark, FaFile } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { sendDirectMessage, sendMessageWithFile, sendBroadcast, markConversationRead } from '../../services/messageService';
import { COLLECTIONS } from '../../config/constants';
import { formatRelativeTime } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';

export default function SupportMessages() {
  const { user, userData } = useAuth();
  const [selectedConv, setSelectedConv] = useState(null);
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [sending, setSending] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('all');
  const [broadcastAttachment, setBroadcastAttachment] = useState(null);
  const [broadcastSending, setBroadcastSending] = useState(false);

  const { data: conversations, loading: convLoading } = useFirestoreQuery('conversations', {
    orderByFields: [{ field: 'lastMessageAt', direction: 'desc' }],
    limitCount: 100,
  });

  const { data: messages, loading: msgLoading } = useFirestoreQuery(COLLECTIONS.MESSAGES, {
    filters: selectedConv ? [{ field: 'conversationId', operator: '==', value: selectedConv }] : [],
    orderByFields: [{ field: 'createdAt', direction: 'asc' }],
    limitCount: 100,
  });

  const handleFileSelect = (e, setter) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 25MB.');
      e.target.value = '';
      return;
    }
    setter(file);
    e.target.value = '';
  };

  const handleSend = async () => {
    if ((!message.trim() && !attachment) || !selectedConv) return;
    setSending(true);
    try {
      const conv = conversations.find((c) => c.id === selectedConv);
      const recipientId = (conv?.participants || []).find((p) => p !== user.uid);
      const recipientName = conv?.participantNames?.[recipientId] || 'User';

      if (attachment) {
        await sendMessageWithFile({
          file: attachment,
          senderId: user.uid,
          senderName: userData?.fullName || 'Support',
          senderRole: userData?.role || 'admin',
          recipientId,
          recipientName,
          content: message.trim(),
        });
      } else {
        await sendDirectMessage({
          senderId: user.uid,
          senderName: userData?.fullName || 'Support',
          senderRole: userData?.role || 'admin',
          recipientId,
          recipientName,
          content: message.trim(),
        });
      }
      setMessage('');
      setAttachment(null);
      toast.success('Reply sent!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim() && !broadcastAttachment) return;
    setBroadcastSending(true);
    try {
      let uploaded = null;
      if (broadcastAttachment) {
        const { uploadFile } = await import('../../services/storageService');
        uploaded = await uploadFile(broadcastAttachment, 'message-attachments', user.uid);
      }
      await sendBroadcast({
        adminId: user.uid,
        adminName: userData?.fullName || 'Admin',
        content: broadcastMessage.trim(),
        targetRole: broadcastTarget,
        attachment: uploaded,
      });
      setBroadcastOpen(false);
      setBroadcastMessage('');
      setBroadcastAttachment(null);
      toast.success('Broadcast sent to all users!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBroadcastSending(false);
    }
  };

  if (convLoading) return <Spinner label="Loading support messages..." />;

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Support Messages"
        subtitle="View and reply to user support messages"
        icon={<FaHeadset />}
        extra={
          <Button variant="primary" size="sm" onClick={() => setBroadcastOpen(true)}>
            <FaBullhorn /> Broadcast to Users
          </Button>
        }
      />

      <div className="support-layout">
        <Card className="support-conversations">
          <CardHeader><CardTitle>Conversations</CardTitle></CardHeader>
          <CardBody>
            {conversations.length === 0 ? (
              <EmptyState icon={<FaHeadset />} title="No support messages" message="When users send messages, they will appear here." />
            ) : (
              <div className="support-conversation-list">
                {conversations.map((conv) => {
                  const otherId = (conv.participants || []).find((p) => p !== user.uid);
                  const otherName = conv.participantNames?.[otherId] || 'User';
                  const unread = conv.unreadCounts?.[user.uid] || 0;
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      className={`support-conversation-item ${selectedConv === conv.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedConv(conv.id);
                        markConversationRead(conv.id, user.uid).catch(() => {});
                      }}
                    >
                      <div className="support-conversation-avatar"><FaUser /></div>
                      <div className="support-conversation-info">
                        <span className="support-conversation-name">{otherName}</span>
                        <span className="support-conversation-preview">{conv.lastMessage || 'No messages yet'}</span>
                      </div>
                      <div className="support-conversation-meta">
                        {unread > 0 && <span className="conversation-item-badge">{unread}</span>}
                        <span className="support-conversation-time">
                          {formatRelativeTime(conv.lastMessageAt?.toDate?.() || conv.lastMessageAt)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="support-thread">
          <CardHeader>
            <CardTitle>{selectedConv ? 'Conversation' : 'Select a conversation'}</CardTitle>
          </CardHeader>
          <CardBody>
            {!selectedConv ? (
              <EmptyState icon={<FaHeadset />} title="No conversation selected" message="Select a user from the left to view and reply to their messages." />
            ) : (
              <>
                <div className="messages-thread">
                  {msgLoading ? (
                    <Spinner label="Loading messages..." />
                  ) : messages.length === 0 ? (
                    <EmptyState icon={<FaHeadset />} title="No messages yet" message="Start the conversation by sending a message below." />
                  ) : (
                    messages.map((msg) => (
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}