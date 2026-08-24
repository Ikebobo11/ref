/**
 * LETCON - ChatThread Component
 * Displays a thread of messages with attachment support.
 */
import { useEffect, useRef } from 'react';
import { FaFile, FaDownload } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { formatRelativeTime } from '../../utils/formatters';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';
import ChatComposer from './ChatComposer';

/**
 * ChatThread component.
 * @param {Object} props - Component props.
 * @param {string} props.conversationId - The conversation ID.
 * @param {Function} props.onSend - Send callback.
 * @param {boolean} [props.sending] - Whether sending is in progress.
 */
export default function ChatThread({ conversationId, onSend, sending = false }) {
  const { user } = useAuth();
  const threadRef = useRef(null);

  const { data: messages, loading } = useFirestoreQuery(COLLECTIONS.MESSAGES, {
    filters: [{ field: 'conversationId', operator: '==', value: conversationId }],
    orderByFields: [{ field: 'createdAt', direction: 'asc' }],
    limitCount: 100,
  });

  /**
   * Auto-scrolls to the bottom on new messages.
   */
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages.length, conversationId]);

  return (
    <div className="chat-thread">
      <div className="chat-thread-messages" ref={threadRef}>
        {loading ? (
          <Spinner label="Loading messages..." />
        ) : messages.length === 0 ? (
          <EmptyState
            icon={<FaCommentDots />}
            title="No messages yet"
            message="Start the conversation by sending a message below."
          />
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-bubble ${msg.senderId === user?.uid ? 'own' : 'other'}`}
            >
              <div className="message-bubble-header">
                <span className="message-bubble-sender">
                  {msg.senderName || 'User'}
                  {msg.senderRole === 'admin' || msg.senderRole === 'super_admin' ? (
                    <Badge variant="info" size="sm">Staff</Badge>
                  ) : null}
                </span>
                <span className="message-bubble-time">
                  {formatRelativeTime(msg.createdAt?.toDate?.() || msg.createdAt)}
                </span>
              </div>
              {msg.content && <p className="message-bubble-content">{msg.content}</p>}
              {msg.attachment && (
                <a
                  href={msg.attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="message-attachment"
                >
                  <FaFile className="message-attachment-icon" />
                  <div className="message-attachment-info">
                    <span className="message-attachment-name">{msg.attachment.name}</span>
                    <span className="message-attachment-size">
                      {msg.attachment.size ? `${(msg.attachment.size / 1024 / 1024).toFixed(2)} MB` : ''}
                    </span>
                  </div>
                  <FaDownload className="message-attachment-download" />
                </a>
              )}
            </div>
          ))
        )}
      </div>


