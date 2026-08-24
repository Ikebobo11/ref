/**
 * LETCON - ConversationList Component
 * Displays a list of conversations for the current user.
 */
import { FaCommentDots } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { formatRelativeTime } from '../../utils/formatters';
import EmptyState from '../ui/EmptyState';

export default function ConversationList({ onSelect, selectedId }) {
  const { user } = useAuth();
  const { data: conversations, loading } = useFirestoreQuery('conversations', {
    filters: [{ field: 'participants', operator: 'array-contains', value: user?.uid || '' }],
    orderByFields: [{ field: 'lastMessageAt', direction: 'desc' }],
    limitCount: 50,
  });

  if (loading) return <div className="conversation-list-loading">Loading conversations...</div>;

  if (conversations.length === 0) {
    return <EmptyState icon={<FaCommentDots />} title="No conversations yet" message="Messages from support and other users will appear here." />;
  }

  const getOtherParticipantName = (conversation) => {
    const names = conversation.participantNames || {};
    const otherId = (conversation.participants || []).find((p) => p !== user?.uid);
    return otherId ? names[otherId] : 'User';
  };

  return (
    <div className="conversation-list">
      {conversations.map((conversation) => {
        const otherName = getOtherParticipantName(conversation);
        const unread = conversation.unreadCounts?.[user?.uid] || 0;
        return (
          <button
            key={conversation.id}
            type="button"
            className={`conversation-item ${selectedId === conversation.id ? 'active' : ''}`}
            onClick={() => onSelect(conversation.id)}
          >
            <div className="conversation-item-avatar">{otherName?.charAt(0) || 'U'}</div>
            <div className="conversation-item-info">
              <span className="conversation-item-name">{otherName}</span>
              <span className="conversation-item-preview">{conversation.lastMessage || 'No messages yet'}</span>
            </div>
            <div className="conversation-item-meta">
              {unread > 0 && <span className="conversation-item-badge">{unread}</span>}
              <span className="conversation-item-time">
                {formatRelativeTime(conversation.lastMessageAt?.toDate?.() || conversation.lastMessageAt)}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
</｜DSML｜>
<task_progress>
- [ ] Analyze current task confirmation flow (performance issue)
- [ ] Analyze notification/messaging system
- [ ] Optimize task approval/rejection for speed
- [x] Create messaging service with broadcasts, direct messages, file attachments
- [x] Create ChatComposer with file attachment
- [ ] Create ConversationList component
- [ ] Implement admin-to-user messaging with notifications
- [ ] Implement earner-admin chat and admin-superadmin chat
- [ ] Add file attachment to message inputs
- [ ] Test and verify
</task_progress>
</｜DSML｜>