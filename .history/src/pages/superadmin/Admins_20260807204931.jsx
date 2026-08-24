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
import { COLLECTIONS } from '../../config/constants';
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


