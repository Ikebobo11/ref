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


