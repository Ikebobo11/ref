/**
 * LETCON - Advertiser Messages Page
 * Messaging interface for the advertiser.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaPaperPlane, FaCommentDots } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { addDocument } from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import { formatRelativeTime } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';

/**
 * Advertiser messages page component.
 */
export default function Messages() {
  const { user, userData } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const { data: messages, loading } = useFirestoreQuery(COLLECTIONS.MESSAGES, {
    filters: [{ field: 'uid', operator: '==', value: user?.uid || '' }],
    orderByFields: [{ field: 'createdAt', direction: 'desc' }],
    limitCount: 50,
  });

  /**
   * Sends a message.
   */
  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await addDocument(COLLECTIONS.MESSAGES, {
        uid: user.uid,
        senderId: user.uid,
        senderName: userData?.fullName,
        content: message.trim(),
        createdAt: new Date(),
      });
      setMessage('');
      toast.success('Message sent!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Messages"
        subtitle="Communicate with LETCON support and earners"
        icon={<FaCommentDots />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="messages-thread">
            {messages.length === 0 ? (
              <EmptyState
                icon={<FaCommentDots />}
                title="No messages yet"
                message="Send a message to LETCON support or your earners."
              />
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-bubble ${msg.senderId === user?.uid ? 'own' : 'other'}`}
                >
                  <div className="message-bubble-header">
                    <span className="message-bubble-sender">{msg.senderName || 'User'}</span>
                    <span className="message-bubble-time">
                      {formatRelativeTime(msg.createdAt?.toDate?.() || msg.createdAt)}
                    </span>
                  </div>
                  <p className="message-bubble-content">{msg.content}</p>
                </div>
              ))
            )}
          </div>

          <div className="message-composer">
            <Input
              placeholder="Type your message..."
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
              <FaPaperPlane /> Send
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}