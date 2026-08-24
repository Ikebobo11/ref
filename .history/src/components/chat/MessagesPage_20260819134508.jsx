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

  const handleSend = useCallback(async (content, attachment) => {
    // sendDirectMessage handles conversation creation automatically
    // via getOrCreateConversation — no need to pre-create
    try {
      let result;
      if (attachment) {
        result = await sendMessageWithFile({
          file: attachment,
          senderId: user.uid,
          senderName: userData?.fullName || 'User',
          senderRole: userData?.role,
          recipientId: SUPPORT_UID,
          recipientName: 'LETCON Support',
          content,
        });
      } else {
        result = await sendDirectMessage({
          senderId: user.uid,
          senderName: userData?.fullName || 'User',
          senderRole: userData?.role,
          recipientId: SUPPORT_UID,
          recipientName: 'LETCON Support',
          content,
        });
      }
      // Set the conversation ID after first successful send
      if (result?.conversation?.id && !selectedConv) {
        setSelectedConv(result.conversation.id);
        markConversationRead(result.conversation.id, user.uid).catch(() => {});
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