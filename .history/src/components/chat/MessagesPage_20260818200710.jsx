/**
 * LETCON - MessagesPage Component
 * Reusable messaging UI with text input and file attachment.
 * The message input is always visible. Conversation is created on first send.
 */
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FaCommentDots, FaHeadset } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import {
  sendDirectMessage,
  sendMessageWithFile,
  markConversationRead,
  getConversationId,
} from '../../services/messageService';
import PageHeader from '../ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../ui/Card';
import ConversationList from './ConversationList';
import ChatThread from './ChatThread';

/** Fixed support user ID — all user messages route to this conversation */
const SUPPORT_UID = 'support';

export default function MessagesPage({ subtitle = 'Chat with LETCON support' }) {
  const { user, userData } = useAuth();
  const [selectedConv, setSelectedConv] = useState(null);
  const [convReady, setConvReady] = useState(false);

  // Ensure the support conversation exists, then show the thread
  const ensureConversation = useCallback(async () => {
    if (convReady) return selectedConv;
    try {
      const convId = getConversationId(user.uid, SUPPORT_UID);
      const { getOrCreateConversation } = await import('../../services/messageService');
      await getOrCreateConversation({
        participant1: user.uid,
        participant2: SUPPORT_UID,
        participant1Name: userData?.fullName || 'User',
        participant2Name: 'LETCON Support',
        type: 'support',
      });
      setSelectedConv(convId);
      setConvReady(true);
      markConversationRead(convId, user.uid).catch(() => {});
      return convId;
    } catch (error) {
      console.error('[LETCON] Failed to init chat:', error);
      toast.error('Could not connect to support. Please try again.');
      return null;
    }
  }, [convReady, user.uid, userData?.fullName, selectedConv]);

  const handleSend = useCallback(async (content, attachment) => {
    const convId = await ensureConversation();
    if (!convId) return;

    try {
      if (attachment) {
        await sendMessageWithFile({
          file: attachment,
          senderId: user.uid,
          senderName: userData?.fullName || 'User',
          senderRole: userData?.role,
          recipientId: SUPPORT_UID,
          recipientName: 'LETCON Support',
          content,
        });
      } else {
        await sendDirectMessage({
          senderId: user.uid,
          senderName: userData?.fullName || 'User',
          senderRole: userData?.role,
          recipientId: SUPPORT_UID,
          recipientName: 'LETCON Support',
          content,
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, [ensureConversation, user.uid, userData?.fullName, userData?.role]);

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Messages"
        subtitle={subtitle}
        icon={<FaCommentDots />}
      />
      <div className="chat-layout">
        <Card className="chat-sidebar">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardBody>
            <ConversationList
              onSelect={(id) => {
                setSelectedConv(id);
                setConvReady(true);
                markConversationRead(id, user.uid).catch(() => {});
              }}
              selectedId={selectedConv}
            />
          </CardBody>
        </Card>
        <Card className="chat-main">
          <CardHeader>
            <CardTitle>
              <FaHeadset /> Support Chat
            </CardTitle>
          </CardHeader>
          <CardBody className="chat-main-body">
            <ChatThread
              conversationId={selectedConv}
              onSend={handleSend}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}