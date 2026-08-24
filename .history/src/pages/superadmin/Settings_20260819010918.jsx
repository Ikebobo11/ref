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
        verificationFee: settings.verificationFee ?? 1000,
        taskPostingFee: settings.taskPostingFee ?? 1000,
        platformRevenuePercent: settings.platformRevenuePercent ?? 30,
        autoApprovalHours: settings.autoApprovalHours ?? 24,
        minWithdrawal: settings.minWithdrawal ?? 1000,
        maxWithdrawal: settings.maxWithdrawal ?? 10000000,
        minWalletFunding: settings.minWalletFunding ?? 100,
        maxWalletFunding: settings.maxWalletFunding ?? 10000000,
        minFollowersToRegister: settings.minFollowersToRegister ?? 1000,

        // Uploads
        maxImageSizeMB: settings.maxImageSizeMB ?? 5,
        maxVideoSizeMB: settings.maxVideoSizeMB ?? 50,
        maxImagesPerTask: settings.maxImagesPerTask ?? 5,
        maxVideosPerTask: settings.maxVideosPerTask ?? 2,
        allowedImageTypes: settings.allowedImageTypes ? [...settings.allowedImageTypes] : [],
        allowedVideoTypes: settings.allowedVideoTypes ? [...settings.allowedVideoTypes] : [],

        // Countries
        countries: settings.countries ? [...settings.countries] : [],

        // Pagination
        pageSize: settings.pageSize ?? 10,
        pageSizeOptions: settings.pageSizeOptions ? [...settings.pageSizeOptions] : [],
        queryLimitDefault: settings.queryLimitDefault ?? 20,
        queryLimitLarge: settings.queryLimitLarge ?? 50,
        queryLimitMax: settings.queryLimitMax ?? 100,
      });
    }
  }, [settings]);

  /**
   * Updates a single form field.
   */
  const updateField = (key, value) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  /**
   * Adds a new tier.
   */
  const addTier = () => {
    const name = window.prompt('Enter tier name (e.g., "20K"):');
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    if (form.tierList.includes(trimmed)) {
      toast.error('Tier already exists');
      return;
    }
    const newTierList = [...form.tierList, trimmed];
    const newMinFollowers = { ...form.tierMinFollowers, [trimmed]: 0 };
    const newPayments = { ...form.tierPayments, [trimmed]: {} };
    form.platformList.forEach((p) => {
      newPayments[trimmed][p] = 0;
    });
    setForm((prev) => ({
      ...prev,
      tierList: newTierList,
      tierMinFollowers: newMinFollowers,
      tierPayments: newPayments,
    }));
  };

  /**
   * Removes a tier.
   */
  const removeTier = (tier) => {
    const newTierList = form.tierList.filter((t) => t !== tier);
    const newMinFollowers = { ...form.tierMinFollowers };
    delete newMinFollowers[tier];
    const newPayments = { ...form.tierPayments };
    delete newPayments[tier];
    setForm((prev) => ({
      ...prev,
      tierList: newTierList,
      tierMinFollowers: newMinFollowers,
      tierPayments: newPayments,
    }));
  };

  /**
   * Updates tier min followers.
   */
  const updateTierMinFollowers = (tier, value) => {
    setForm((prev) => ({
      ...prev,
      tierMinFollowers: { ...prev.tierMinFollowers, [tier]: parseInt(value) || 0 },
    }));
  };

  /**
   * Updates tier payment for a platform.
   */
  const updateTierPayment = (tier, platform, value) => {
    setForm((prev) => ({
      ...prev,
      tierPayments: {
        ...prev.tierPayments,
        [tier]: {
          ...prev.tierPayments[tier],
          [platform]: parseInt(value) || 0,
        },
      },
    }));
  };

  /**
   * Adds a new platform.
   */
  const addPlatform = () => {
    const name = window.prompt('Enter platform name (e.g., "Threads"):');
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    if (form.platformList.includes(trimmed)) {
      toast.error('Platform already exists');
      return;
    }
    const newPlatformList = [...form.platformList, trimmed];
    const newPayments = { ...form.tierPayments };
    form.tierList.forEach((tier) => {
      if (!newPayments[tier]) newPayments[tier] = {};
      newPayments[tier][trimmed] = 0;
    });
    setForm((prev) => ({
      ...prev,
      platformList: newPlatformList,
      tierPayments: newPayments,
    }));
  };

  /**
   * Removes a platform.
   */
  const removePlatform = (platform) => {
    const newPlatformList = form.platformList.filter((p) => p !== platform);
    const newPayments = { ...form.tierPayments };
    form.tierList.forEach((tier) => {
      if (newPayments[tier]) {
        const updated = { ...newPayments[tier] };
        delete updated[platform];
        newPayments[tier] = updated;
      }
    });
    setForm((prev) => ({
      ...prev,
      platformList: newPlatformList,
      tierPayments: newPayments,
    }));
  };

  /**
   * Adds a country.
   */
  const addCountry = () => {
    const name = window.prompt('Enter country name:');
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    if (form.countries.includes(trimmed)) {
      toast.error('Country already exists');
      return;
    }
    setForm((prev) => ({ ...prev, countries: [...prev.countries, trimmed] }));
  };

  /**
   * Removes a country.
   */
  const removeCountry = (country) => {
    setForm((prev) => ({
      ...prev,
      countries: prev.countries.filter((c) => c !== country),
    }));
  };

  /**
   * Adds an allowed image type.
   */
  const addImageType = () => {
    const mime = window.prompt('Enter MIME type (e.g., "image/avif"):');
    if (!mime || !mime.trim()) return;
    const trimmed = mime.trim();
    if (form.allowedImageTypes.includes(trimmed)) {
      toast.error('Type already exists');
      return;
    }
    setForm((prev) => ({
      ...prev,
      allowedImageTypes: [...prev.allowedImageTypes, trimmed],
    }));
  };

  /**
   * Removes an allowed image type.
   */
  const removeImageType = (mime) => {
    setForm((prev) => ({
      ...prev,
      allowedImageTypes: prev.allowedImageTypes.filter((t) => t !== mime),
    }));
  };

  /**
   * Adds an allowed video type.
   */
  const addVideoType = () => {
    const mime = window.prompt('Enter MIME type (e.g., "video/avi"):');
    if (!mime || !mime.trim()) return;
    const trimmed = mime.trim();
    if (form.allowedVideoTypes.includes(trimmed)) {
      toast.error('Type already exists');
      return;
    }
    setForm((prev) => ({
      ...prev,
      allowedVideoTypes: [...prev.allowedVideoTypes, trimmed],
    }));
  };

  /**
   * Removes an allowed video type.
   */
  const removeVideoType = (mime) => {
    setForm((prev) => ({
      ...prev,
      allowedVideoTypes: prev.allowedVideoTypes.filter((t) => t !== mime),
    }));
  };

  /**
   * Adds a page size option.
   */
  const addPageSizeOption = () => {
    const val = window.prompt('Enter page size option (e.g., "100"):');
    if (!val || !val.trim()) return;
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) {
      toast.error('Enter a valid positive number');
      return;
    }
    if (form.pageSizeOptions.includes(num)) {
      toast.error('Option already exists');
      return;
    }
    setForm((prev) => ({
      ...prev,
      pageSizeOptions: [...prev.pageSizeOptions, num].sort((a, b) => a - b),
    }));
  };

  /**
   * Removes a page size option.
   */
  const removePageSizeOption = (val) => {
    setForm((prev) => ({
      ...prev,
      pageSizeOptions: prev.pageSizeOptions.filter((o) => o !== val),
    }));
  };

  /**
   * Saves all settings.
   */
  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      // Build the settings payload
      const payload = {
        platformName: form.platformName,
        supportEmail: form.supportEmail,
        appTagline: form.appTagline,
        currency: form.currency,
        currencySymbol: form.currencySymbol,
        platformList: form.platformList,
        tierList: form.tierList,
        tierMinFollowers: form.tierMinFollowers,
        tierPayments: form.tierPayments,
        verificationFee: form.verificationFee,
        taskPostingFee: form.taskPostingFee,
        platformRevenuePercent: form.platformRevenuePercent,
        earnerRevenuePercent: 100 - form.platformRevenuePercent,
        autoApprovalHours: form.autoApprovalHours,
        minWithdrawal: form.minWithdrawal,
        maxWithdrawal: form.maxWithdrawal,
        minWalletFunding: form.minWalletFunding,
        maxWalletFunding: form.maxWalletFunding,
        minFollowersToRegister: form.minFollowersToRegister,
        maxImageSizeMB: form.maxImageSizeMB,
        maxVideoSizeMB: form.maxVideoSizeMB,
        maxImagesPerTask: form.maxImagesPerTask,
        maxVideosPerTask: form.maxVideosPerTask,
        allowedImageTypes: form.allowedImageTypes,
        allowedVideoTypes: form.allowedVideoTypes,
        countries: form.countries,
        pageSize: form.pageSize,
        pageSizeOptions: form.pageSizeOptions,
        queryLimitDefault: form.queryLimitDefault,
        queryLimitLarge: form.queryLimitLarge,
        queryLimitMax: form.queryLimitMax,
      };

      await updateSettings(payload, userData.uid);
      await logSettingsUpdate(userData.uid, userData.role, payload);
      toast.success('Platform settings saved successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return <Spinner label="Loading settings..." />;
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Platform Settings"
        subtitle="Manage all platform configuration from one place"
        icon={<FaGear />}
      />

      {/* Tab Navigation */}
      <div className="settings-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`settings-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="settings-content">
        {/* ===== GENERAL TAB ===== */}
        {activeTab === 'general' && (
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="form-stack">
                <Input
                  label="Platform Name"
                  value={form.platformName}
                  onChange={(e) => updateField('platformName', e.target.value)}
                />
                <Input
                  label="Support Email"
                  type="email"
                  value={form.supportEmail}
                  onChange={(e) => updateField('supportEmail', e.target.value)}
                />
                <Input
                  label="App Tagline"
                  value={form.appTagline}
                  onChange={(e) => updateField('appTagline', e.target.value)}
                />
                <Input
                  label="Currency Code"
                  value={form.currency}
                  onChange={(e) => updateField('currency', e.target.value)}
                />
                <Input
                  label="Currency Symbol"
                  value={form.currencySymbol}
                  onChange={(e) => updateField('currencySymbol', e.target.value)}
                />
              </div>
            </CardBody>
          </Card>
        )}

        {/* ===== TIERS & PAYMENTS TAB ===== */}
        {activeTab === 'tiers' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Tiers</CardTitle>
                <Button variant="outline" onClick={addTier}>
                  <FaPlus /> Add Tier
                </Button>
              </CardHeader>
              <CardBody>
                {form.tierList.length === 0 ? (
