/**
 * LETCON - Users Page (Super Admin)
 * Full platform user management: view all users, suspend, ban accounts, and send notifications.
 */
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { FaUsers, FaBan, FaPlay, FaTriangleExclamation, FaMagnifyingGlass, FaFilter, FaEnvelope } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { suspendUser, unsuspendUser, banUser } from '../../services/adminService';
import { createNotification } from '../../services/notificationService';
import { COLLECTIONS, NOTIFICATION_TYPES } from '../../config/constants';
import { formatDate } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';

/** Role filter options */
const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'earner', label: 'Earner' },
  { value: 'advertiser', label: 'Advertiser' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
];

/** Status filter options */
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'banned', label: 'Banned' },
];

/**
 * Users page component (Super Admin).
 */
export default function Users() {
  const { userData } = useAuth();
  const [processingId, setProcessingId] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [reason, setReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [messageModal, setMessageModal] = useState(null);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const { data: users, loading } = useFirestoreQuery(COLLECTIONS.USERS, {
    orderByFields: [{ field: 'createdAt', direction: 'desc' }],
    limitCount: 100,
  });

  /**
   * Filtered and searched users.
   */
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.phone?.includes(query)
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter((user) => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        result = result.filter((user) => !user.suspended && !user.banned);
      } else if (statusFilter === 'suspended') {
        result = result.filter((user) => user.suspended && !user.banned);
      } else if (statusFilter === 'banned') {
        result = result.filter((user) => user.banned);
      }
    }

    return result;
  }, [users, searchQuery, roleFilter, statusFilter]);

  /**
   * Clears all filters and search.
   */
  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  const hasActiveFilters = searchQuery.trim() || roleFilter !== 'all' || statusFilter !== 'all';

  const getStatusVariant = (user) => {
    if (user.banned) return 'danger';
    if (user.suspended) return 'warning';
    return 'success';
  };

  const getStatusText = (user) => {
    if (user.banned) return 'Banned';
    if (user.suspended) return 'Suspended';
    return 'Active';
  };

  const handleAction = async () => {
    if (!actionModal) return;
    setProcessingId(actionModal.user.id);
    try {
      const { user, action } = actionModal;
      const actorRole = userData?.role || 'super_admin';
      if (action === 'suspend') {
        await suspendUser(user.id, userData.uid, actorRole, reason);
        toast.success(`Banned ${user.fullName}`);
      }
      setActionModal(null);
      setReason('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <Spinner label="Loading users..." />;
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Users"
        subtitle="Manage all platform users"
        icon={<FaUsers />}
      />

      {/* Search and Filter Bar */}
      <Card className="users-filter-card">
        <CardBody>
          <div className="users-filter-bar">
            <div className="users-search-input">
              <FaMagnifyingGlass />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="users-filter-selects">
              <Select
                options={ROLE_OPTIONS}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="users-filter-select"
              />
              <Select
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="users-filter-select"
              />
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {users.length === 0 ? (
        <EmptyState icon={<FaUsers />} title="No users found" />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={<FaFilter />}
          title="No matching users"
          description="Try adjusting your search or filters"
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Showing {filteredUsers.length} of {users.length} users
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="users-table">
              <div className="users-table-header">
                <span>User</span>
                <span>Role</span>
                <span>Status</span>
                <span>Joined</span>
                <span>Actions</span>
              </div>
              {filteredUsers.map((user) => (
                <div key={user.id} className="users-table-row">
                  <div className="users-table-user">
                    <div className="users-table-avatar">
                      {user.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <span className="users-table-name">{user.fullName}</span>
                      <span className="users-table-email">{user.email}</span>
                    </div>
                  </div>
                  <span className="users-table-role">{user.role?.replace('_', ' ')}</span>
                  <Badge variant={getStatusVariant(user)}>{getStatusText(user)}</Badge>
                  <span className="users-table-date">
                    {formatDate(user.createdAt?.toDate?.() || user.createdAt)}
                  </span>
                  <div className="users-table-actions">
                    {!user.suspended && !user.banned && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActionModal({ user, action: 'suspend' })}
                      >
                        Suspend
                      </Button>
                    )}
                    {user.suspended && !user.banned && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => setActionModal({ user, action: 'unsuspend' })}
                      >
                        <FaPlay /> Unsuspend
                      </Button>
                    )}
                    {!user.banned && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setActionModal({ user, action: 'ban' })}
                      >
                        <FaBan /> Ban
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <Modal
        isOpen={Boolean(actionModal)}
        onClose={() => setActionModal(null)}
        title={`${actionModal?.action === 'ban' ? 'Ban' : actionModal?.action === 'suspend' ? 'Suspend' : 'Unsuspend'} User`}
      >
        {actionModal && (
          <div className="reject-form">
            <div className="action-user-info">
              <FaTriangleExclamation />
              <div>
                <strong>{actionModal.user.fullName}</strong>
                <p>{actionModal.user.email}</p>
              </div>
            </div>
            {(actionModal.action === 'suspend' || actionModal.action === 'ban') && (
              <Input
                label="Reason"
                type="text"
                placeholder={`Reason for ${actionModal.action}`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            )}
            <Button
              variant={actionModal.action === 'ban' ? 'danger' : actionModal.action === 'suspend' ? 'warning' : 'success'}
              fullWidth
              onClick={handleAction}
              loading={processingId === actionModal.user.id}
            >
              Confirm {actionModal.action}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}