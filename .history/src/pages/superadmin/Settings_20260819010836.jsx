/**
 * LETCON - Super Admin Settings Page
 * Full platform configuration: general, tiers, platforms, pricing, uploads, countries, pagination.
 */
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FaGear,
  FaCreditCard,
  FaWallet,
  FaPercent,
  FaSave,
  FaPlus,
  FaTrash,
  FaGlobe,
  FaUpload,
  FaList,
  FaLayerGroup,
  FaHashtag,
} from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { logSettingsUpdate } from '../../services/auditService';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

/** Tab definitions */
const TABS = [
  { key: 'general', label: 'General', icon: <FaGear /> },
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
  useEffect(() => {
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

      <div className="settings-layout">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(handleSave)} className="form-stack">
              <Input
                label="Platform Name"
                placeholder="LETCON"
                error={errors.platformName?.message}
                {...register('platformName')}
              />
              <Input
                label="Support Email"
                type="email"
                placeholder="support@letcon.app"
                error={errors.supportEmail?.message}
                {...register('supportEmail')}
              />
              <Button type="submit" fullWidth loading={saving}>
                <FaGear /> Save Settings
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & Fees</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(handleSave)} className="form-stack">
              <Input
                label={`Verification Fee (${CURRENCY_SYMBOL})`}
                type="number"
                icon={<FaCreditCard />}
                error={errors.verificationFee?.message}
                {...register('verificationFee', { valueAsNumber: true })}
              />
              <Input
                label={`Task Posting Fee (${CURRENCY_SYMBOL})`}
                type="number"
                icon={<FaWallet />}
                error={errors.taskPostingFee?.message}
                {...register('taskPostingFee', { valueAsNumber: true })}
              />
              <Input
                label="Platform Revenue Percent (%)"
                type="number"
                icon={<FaPercent />}
                error={errors.platformRevenuePercent?.message}
                {...register('platformRevenuePercent', { valueAsNumber: true })}
              />
              <Input
                label="Auto-Approval Hours"
                type="number"
                error={errors.autoApprovalHours?.message}
                {...register('autoApprovalHours', { valueAsNumber: true })}
              />
              <Button type="submit" fullWidth loading={saving}>
                <FaGear /> Save Pricing
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}