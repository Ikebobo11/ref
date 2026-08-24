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
import { sendMessage, sendMessageWithFile, sendBroadcast, markConversationRead } from '../../services/messageService';
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

/** Fixed support user ID — matches the one in MessagesPage */
const SUPPORT_UID = 'support';

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
      const recipientId = (conv?.participants || []).find((p) => p !== user.uid && p !== SUPPORT_UID) || (conv?.participants || []).find((p) => p !== user.uid);
      const recipientName = conv?.participantNames?.[recipientId] || 'User';

      // Use sendMessage directly with the existing conversation ID
      // so the reply stays in the same conversation the user started.
      // Do NOT use sendDirectMessage — it would create a new conversation
      // with a different ID (admin.uid__user.uid vs support__user.uid).
      if (attachment) {
        const { uploadMessageAttachment } = await import('../../services/storageService');
        const uploadResult = await uploadMessageAttachment(attachment, user.uid);
        // Normalize attachment object to use 'url' property for UI components
        const normalizedAttachment = {
          url: uploadResult.downloadUrl,
          path: uploadResult.path,
          name: uploadResult.name,
          size: uploadResult.size,
          type: uploadResult.type,
        };
        await sendMessage({
          conversationId: selectedConv,
          senderId: user.uid,
          senderName: userData?.fullName || 'Support',
          senderRole: userData?.role || 'admin',
          recipientId,
          content: message.trim(),
          attachment: normalizedAttachment,
        });
      } else {
        await sendMessage({
          conversationId: selectedConv,
          senderId: user.uid,
          senderName: userData?.fullName || 'Support',
          senderRole: userData?.role || 'admin',
          recipientId,
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
        const { uploadMessageAttachment } = await import('../../services/storageService');
        const uploadResult = await uploadMessageAttachment(broadcastAttachment, user.uid);
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
                      <div key={msg.id} className={`message-bubble ${msg.senderId === user?.uid ? 'own' : 'other'}`}>
                        <div className="message-bubble-header">
                          <span className="message-bubble-sender">
                            {msg.senderName || 'User'}
                            {msg.senderRole === 'admin' || msg.senderRole === 'super_admin' ? (
                              <Badge variant="info">Staff</Badge>
                            ) : null}
                          </span>
                          <span className="message-bubble-time">
                            {formatRelativeTime(msg.createdAt?.toDate?.() || msg.createdAt)}
                          </span>
                        </div>
                        {msg.content && <p className="message-bubble-content">{msg.content}</p>}
                        {msg.attachment && (
                          <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer" className="message-attachment">
                            <FaFile className="message-attachment-icon" />
                            <div className="message-attachment-info">
                              <span className="message-attachment-name">{msg.attachment.name}</span>
                              <span className="message-attachment-size">
                                {msg.attachment.size ? `${(msg.attachment.size / 1024 / 1024).toFixed(2)} MB` : ''}
                              </span>
                            </div>
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="message-composer">
                  {attachment && (
                    <div className="chat-composer-attachment">
                      <FaFile className="chat-composer-attachment-icon" />
                      <div className="chat-composer-attachment-info">
                        <span className="chat-composer-attachment-name">{attachment.name}</span>
                        <span className="chat-composer-attachment-size">{(attachment.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <button type="button" className="chat-composer-attachment-remove" onClick={() => setAttachment(null)} aria-label="Remove attachment">
                        <FaXmark />
                      </button>
                    </div>
                  )}
                  <div className="chat-composer-input-row">
                    <input type="file" id="support-file-input" className="chat-file-input" onChange={(e) => handleFileSelect(e, setAttachment)} hidden />
                    <button type="button" className="chat-attach-btn" onClick={() => document.getElementById('support-file-input')?.click()} disabled={sending} aria-label="Attach file">
                      <FaPaperclip />
                    </button>
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
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      <Modal isOpen={broadcastOpen} onClose={() => setBroadcastOpen(false)} title="Broadcast Message to Users">
        <div className="broadcast-form">
          <p className="broadcast-info">Send a message to all users or a specific role. They will receive it as a notification.</p>
          <Select
            label="Target Audience"
            value={broadcastTarget}
            onChange={(e) => setBroadcastTarget(e.target.value)}
            options={[
              { value: 'all', label: 'All Users' },
              { value: 'earner', label: 'Earners Only' },
              { value: 'advertiser', label: 'Advertisers Only' },
            ]}
          />
          <Input label="Message" type="text" placeholder="Enter your broadcast message..." value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} />
          {broadcastAttachment && (
            <div className="chat-composer-attachment">
              <FaFile className="chat-composer-attachment-icon" />
              <div className="chat-composer-attachment-info">
                <span className="chat-composer-attachment-name">{broadcastAttachment.name}</span>
                <span className="chat-composer-attachment-size">{(broadcastAttachment.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <button type="button" className="chat-composer-attachment-remove" onClick={() => setBroadcastAttachment(null)} aria-label="Remove attachment">
                <FaXmark />
              </button>
            </div>
          )}
          <div className="broadcast-attach-row">
            <input type="file" id="broadcast-file-input" className="chat-file-input" onChange={(e) => handleFileSelect(e, setBroadcastAttachment)} hidden />
            <Button variant="outline" size="sm" onClick={() => document.getElementById('broadcast-file-input')?.click()}>
              <FaPaperclip /> Attach File
            </Button>
          </div>
          <Button variant="primary" fullWidth onClick={handleBroadcast} loading={broadcastSending} disabled={!broadcastMessage.trim() && !broadcastAttachment}>
            <FaBullhorn /> Send Broadcast
          </Button>
        </div>
      </Modal>
    </div>
  );
}