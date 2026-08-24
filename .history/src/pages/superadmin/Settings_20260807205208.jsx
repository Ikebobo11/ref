/**
 * LETCON - Settings Page
 * Super admin manages platform settings, pricing, and payment gateway.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FaGear, FaCreditCard, FaWallet, FaPercent } from 'react-icons/fa6';
import { settingsSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';
import { getDocument, setDocument } from '../../services/firestoreService';
import { COLLECTIONS, FEES, REVENUE_SPLIT, AUTO_APPROVAL_HOURS, CURRENCY_SYMBOL } from '../../config/constants';
import { logSettingsUpdate } from '../../services/auditService';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

/**
 * Settings page component.
 */
export default function Settings() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      platformName: 'LETCON',
      supportEmail: 'support@letcon.app',
      verificationFee: FEES.VERIFICATION_FEE,
      taskPostingFee: FEES.TASK_POSTING_FEE,
      platformRevenuePercent: REVENUE_SPLIT.PLATFORM_PERCENT,
      autoApprovalHours: AUTO_APPROVAL_HOURS,
    },
  });

  /**
   * Loads current settings.
   */
  useState(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const settings = await getDocument(COLLECTIONS.SETTINGS, 'platform');
        if (settings) {
          // Update form defaults with loaded settings
        }
      } catch (error) {
        console.error('[LETCON] Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  /**
   * Saves platform settings.
   * @param {Object} data - Settings data.
   */
  const handleSave = async (data) => {
    setSaving(true);
    try {
      await setDocument(COLLECTIONS.SETTINGS, 'platform', {
        ...data,
        updatedBy: userData.uid,
        updatedAt: new Date(),
      });

      await logSettingsUpdate(userData.uid, userData.role, data);
      toast.success('Platform settings saved successfully!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner label="Loading settings..." />;
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Platform Settings"
        subtitle="Manage platform configuration, pricing, and payment gateway"
        icon={<FaGear />}
      />


