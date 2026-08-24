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
      const { getDocument } = await import('../../services/firestoreService');
      const conv = await getDocument('conversations', selectedConv);
      const recipientId = (conv.participants || []).find((p) => p !== user.uid);
      const recipientName = conv.participantNames?.[recipientId] || 'Support';

      if (attachment) {
        await sendMessageWithFile({
          file: attachment,
          senderId: user.uid,
          senderName: userData?.fullName,
          senderRole: userData?.role,
          recipientId,
          recipientName,
          content,
        });
      } else {
        await sendDirectMessage({
          senderId: user.uid,
          senderName: userData?.fullName || 'User',
          senderRole: userData?.role,
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

  return (
    <div className="dashboard-page">
      <PageHeader title="Messages" subtitle={subtitle} icon={<FaCommentDots />} />
      <div className="chat-layout">
        <Card className="chat-sidebar">
          <CardHeader><CardTitle>Conversations</CardTitle></CardHeader>
          <CardBody>
            <ConversationList
              onSelect={(id) => {
                setSelectedConv(id);
                markConversationRead(id, user.uid).catch(() => {});
              }}
              selectedId={selectedConv}
            />
          </CardBody>
        </Card>
        <Card className="chat-main">
          <CardHeader>
            <CardTitle>{selectedConv ? 'Conversation' : 'Select a conversation'}</CardTitle>
          </CardHeader>
          <CardBody className="chat-main-body">
            {!selectedConv ? (
              <EmptyState
                icon={<FaCommentDots />}
                title="No conversation selected"
                message="Select a conversation to start chatting."
              />
            ) : (
              <ChatThread conversationId={selectedConv} onSend={handleSend} />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
