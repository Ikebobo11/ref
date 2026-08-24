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
