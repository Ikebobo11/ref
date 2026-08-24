/**
 * LETCON - Admins Page
 * Super admin manages admin accounts: invite and remove admins.
 * Super Admin cannot be removed by any other account.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FaUserShield, FaUserPlus, FaTrash, FaEnvelope, FaUser } from 'react-icons/fa6';
import { adminInviteSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { inviteAdmin, removeAdmin } from '../../services/adminService';
import { COLLECTIONS, ROLES } from '../../config/constants';
import { formatDate } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';

/**
 * Admins page component.
 */
export default function Admins() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [removeModal, setRemoveModal] = useState(null);
  const [removing, setRemoving] = useState(false);

  const { data: admins, loading: adminsLoading } = useFirestoreQuery(COLLECTIONS.ADMINS, {
    orderByFields: [{ field: 'invitedAt', direction: 'desc' }],
    limitCount: 50,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminInviteSchema),
  });

  /**
   * Invites a new admin.
   * @param {Object} data - Form data.
   */
  const handleInvite = async (data) => {
    setLoading(true);
    try {
      await inviteAdmin({
        email: data.email,
        fullName: data.fullName,
        superAdminId: userData.uid,
      });
      toast.success(`Admin invited: ${data.email}`);
      reset();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Removes an admin.
   */
  const handleRemove = async () => {
    if (!removeModal) return;
    setRemoving(true);
    try {
      await removeAdmin(removeModal.id, userData.uid);
      toast.success('Admin removed.');
      setRemoveModal(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRemoving(false);
    }
  };

  if (adminsLoading) {
    return <Spinner label="Loading admins..." />;
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Manage Admins"
        subtitle="Invite and remove admin accounts"
        icon={<FaUserShield />}
      />

      <div className="admins-layout">
        <Card>
          <CardHeader>
            <CardTitle>Invite New Admin</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(handleInvite)} className="form-stack">
              <Input
                label="Full Name"
                placeholder="Admin full name"
                icon={<FaUser />}
                error={errors.fullName?.message}
                {...register('fullName')}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="admin@example.com"
                icon={<FaEnvelope />}
                error={errors.email?.message}
                {...register('email')}
              />
              <Button type="submit" fullWidth loading={loading}>
                <FaUserPlus /> Invite Admin
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Admins</CardTitle>
          </CardHeader>
          <CardBody>
            {admins.length === 0 ? (
              <EmptyState icon={<FaUserShield />} title="No admins yet" />
            ) : (
              <div className="admins-list">
                {admins.map((admin) => (
                  <div key={admin.id} className="admin-item">
                    <div className="admin-item-avatar">
                      {admin.fullName?.charAt(0) || 'A'}
                    </div>
                    <div className="admin-item-info">
                      <span className="admin-item-name">{admin.fullName}</span>
                      <span className="admin-item-email">{admin.email}</span>
                      <span className="admin-item-date">
                        Invited {formatDate(admin.invitedAt?.toDate?.() || admin.invitedAt)}
                      </span>
                    </div>
                    <Badge variant={admin.status === 'invited' ? 'warning' : 'success'}>
                      {admin.status}
                    </Badge>
                    {admin.role === ROLES.SUPER_ADMIN ? (
                      <Badge variant="primary">Super Admin
                      size="sm"
                      onClick={() => setRemoveModal(admin)}
                    >
                      <FaTrash /> Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Remove Modal */}
      <Modal
        isOpen={Boolean(removeModal)}
        onClose={() => setRemoveModal(null)}
        title="Remove Admin"
      >
        <div className="reject-form">
          <p className="reject-info">
            Are you sure you want to remove <strong>{removeModal?.fullName}</strong> as an admin?
            This action cannot be undone.
          </p>
          <Button
            variant="danger"
            fullWidth
            onClick={handleRemove}
            loading={removing}
          >
            <FaTrash /> Confirm Removal
          </Button>
        </div>
      </Modal>
    </div>
  );
}