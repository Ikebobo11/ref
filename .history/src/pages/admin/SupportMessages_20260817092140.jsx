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

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Support Messages"
        subtitle="View and reply to user support messages"
        icon={<FaHeadset />}
      />

      <div className="support-layout">
        <Card className="support-conversations">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardBody>
            {conversationList.length === 0 ? (
              <EmptyState
                icon={<FaHeadset />}
                title="No support messages"
                message="When users send messages, they will appear here."
              />
            ) : (
              <div className="support-conversation-list">
                {conversationList.map((conv) => (
                  <button
                    key={conv.uid}
                    type="button"
                    className={`support-conversation-item ${selectedUser === conv.uid ? 'active' : ''}`}
                    onClick={() => setSelectedUser(conv.uid)}
                  >
                    <div className="support-conversation-avatar">
                      <FaUser />
                    </div>
                    <div className="support-conversation-info">
                      <span className="support-conversation-name">{conv.userName}</span>
                      <span className="support-conversation-preview">
                        {conv.lastMessage.content?.slice(0, 50)}
                      </span>
                    </div>
                    <span className="support-conversation-time">
                      {formatRelativeTime(conv.lastMessage.createdAt?.toDate?.() || conv.lastMessage.createdAt)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="support-thread">
          <CardHeader>
            <CardTitle>
              {selectedConversation ? `Conversation with ${selectedConversation.userName}` : 'Select a conversation'}
            </CardTitle>
          </CardHeader>
          <CardBody>
            {!selectedConversation ? (
              <EmptyState
                icon={<FaHeadset />}
                title="No conversation selected"
                message="Select a user from the left to view and reply to their messages."
              />
            ) : (
              <>
                <div className="messages-thread">
                  {selectedConversation.messages
                    .sort((a, b) => {
                      const aTime = a.createdAt?.toDate?.() || a.createdAt || 0;
                      const bTime = b.createdAt?.toDate?.() || b.createdAt || 0;
                      return new Date(aTime) - new Date(bTime);
                    })
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className={`message-bubble ${msg.senderId === user?.uid ? 'own' : 'other'}`}
                      >
                        <div className="message-bubble-header">
                          <span className="message-bubble-sender">
                            {msg.senderName || 'User'}
                            {msg.isSupportReply && <Badge variant="info" size="sm">Support</Badge>}
                          </span>
                          <span className="message-bubble-time">
                            {formatRelativeTime(msg.createdAt?.toDate?.() || msg.createdAt)}
                          </span>
                        </div>
                        <p className="message-bubble-content">{msg.content}</p>
                      </div>
                    ))}
                </div>

                <div className="message-composer">
                  <Input
                    placeholder="Type your reply..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button onClick={handleSend} loading={sending}>
                    <FaPaperPlane /> Reply
                  </Button>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}