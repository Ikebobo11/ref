/**
 * LETCON - Users Page
 * Admin manages users: view, suspend, and ban accounts.
 */
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { FaUsers, FaBan, FaPlay, FaTriangleExclamation, FaMagnifyingGlass, FaFilter } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { suspendUser, unsuspendUser, banUser } from '../../services/adminService';
import { COLLECTIONS } from '../../config/constants';
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
 * Users page component.
 */
export default function Users() {
  const { userData } = useAuth();
  const [processingId, setProcessingId] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [reason, setReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: users, loading } = useFirestoreQuery(COLLECTIONS.USERS, {
    orderByFields: [{ field: 'createdAt', direction: 'desc' }],
    limitCount: 50,
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

      {users.length === 0 ? (
        <EmptyState icon={<FaUsers />} title="No users found" />
      ) : (
        <Card>
          <CardBody>
            <div className="users-table">
              <div className="users-table-header">
                <span>User</span>
                <span>Role</span>
                <span>Status</span>
                <span>Joined</span>
                <span>Actions</span>
              </div>
              {users.map((user) => (
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

      {/* Action Modal */}
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