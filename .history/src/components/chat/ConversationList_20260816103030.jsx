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
