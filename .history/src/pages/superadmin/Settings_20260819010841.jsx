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
  { key: 'tiers', label: 'Tiers & Payments', icon: <FaLayerGroup /> },
  { key: 'platforms', label: 'Platforms', icon: <FaGlobe /> },
  { key: 'pricing', label: 'Pricing & Fees', icon: <FaCreditCard /> },
  { key: 'uploads', label: 'Upload Limits', icon: <FaUpload /> },
  { key: 'countries', label: 'Countries', icon: <FaGlobe /> },
  { key: 'pagination', label: 'Pagination', icon: <FaList /> },
];

/**
 * Settings page component with all configurable sections.
 */
export default function Settings() {
  const { userData } = useAuth();
  const { settings, loading, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  // Local form state - initialized from settings once loaded
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (settings) {
      setForm({
        // General
        platformName: settings.platformName || '',
        supportEmail: settings.supportEmail || '',
        appTagline: settings.appTagline || '',
        currency: settings.currency || 'NGN',
        currencySymbol: settings.currencySymbol || '₦',

        // Tiers
        tierList: settings.tierList ? [...settings.tierList] : [],
        tierMinFollowers: settings.tierMinFollowers ? { ...settings.tierMinFollowers } : {},
        tierPayments: settings.tierPayments ? JSON.parse(JSON.stringify(settings.tierPayments)) : {},

        // Platforms
        platformList: settings.platformList ? [...settings.platformList] : [],

        // Pricing
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