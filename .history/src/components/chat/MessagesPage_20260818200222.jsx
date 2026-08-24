/**
 * LETCON - MessagesPage Component
 * Reusable conversation-based messaging UI with file attachments.
 * Uses a fixed support conversation so the message input is always visible.
 */
import { useState, useEffect, useCallback } from 'react';
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
import Spinner from '../ui/Spinner';

/** Fixed support user ID — all user messages route to this conversation */
const SUPPORT_UID = 'support';

export default function MessagesPage({ subtitle = 'Chat with LETCON support' }) {
  const { user, userData } = useAuth();
  const [selectedConv, setSelectedConv] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Build the support conversation ID and ensure it exists on mount
  useEffect(() => {
    const initChat = async () => {
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
        markConversationRead(convId, user.uid).catch(() => {});
      } catch (error) {
        console.error('[LETCON] Failed to init chat:', error);
      } finally {
        setInitializing(false);
      }
    };

    initChat();
  }, [user.uid, userData?.fullName]);

  const handleSend = useCallback(async (content, attachment) => {
    if (!selectedConv) {
      toast.error('No conversation available. Please try again later.');
      return;
    }
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
  }, [selectedConv, user.uid, userData?.fullName, userData?.role]);

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
            {initializing ? (
              <div className="chat-thread" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <Spinner label="Connecting to support..." />
              </div>
            ) : (
              <ChatThread conversationId={selectedConv} onSend={handleSend} />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}