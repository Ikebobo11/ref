/**
 * LETCON - MessagesPage Component
 * Reusable conversation-based messaging UI with file attachments.
 * Auto-starts a conversation with the first available admin so the
 * message input is always visible.
 */
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FaCommentDots, FaHeadset } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
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

export default function MessagesPage({ subtitle = 'Chat with LETCON support' }) {
  const { user, userData } = useAuth();
  const [selectedConv, setSelectedConv] = useState(null);
  const [sending, setSending] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Query admins to allow users to start a chat with them
  const { data: admins, loading: adminsLoading } = useFirestoreQuery('users', {
    filters: [{ field: 'role', operator: '==', value: 'admin' }],
    limitCount: 5,
  });

  // Auto-start a conversation with the first available admin on mount
  useEffect(() => {
    if (adminsLoading) return;
    if (admins.length === 0) {
      setInitializing(false);
      return;
    }

    const initChat = async () => {
      try {
        const admin = admins[0];
        const adminId = admin.uid || admin.id;
        const convId = getConversationId(user.uid, adminId);

        const { getOrCreateConversation } = await import('../../services/messageService');
        await getOrCreateConversation({
          participant1: user.uid,
          participant2: adminId,
          participant1Name: userData?.fullName || 'User',
          participant2Name: admin.fullName || 'Admin',
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
  }, [admins, adminsLoading, user.uid, userData?.fullName]);

  const handleSend = useCallback(async (content, attachment) => {
    if (!selectedConv) {
      toast.error('No conversation available. Please try again later.');
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
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
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
              ) : (
                <span>
                  <FaHeadset /> Message Admin Support
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardBody className="chat-main-body">
            {!selectedConv ? (
              <EmptyState
                icon={<FaHeadset />}
                title="Message LETCON Support"
                message="Click 'Message Admin' to start a chat with our support team. You can send text messages and attach files."
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