/**
 * LETCON - Upgrade Page
 * Request a tier upgrade (follower-count tier only, separate from Account Change Request).
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FaArrowUpRightDots, FaUsers, FaLink, FaImage } from 'react-icons/fa6';
import { upgradeSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';
import { uploadUpgradeProof } from '../../services/storageService';
import { addDocument } from '../../services/firestoreService';
import { COLLECTIONS, TIERS, TIER_MIN_FOLLOWERS } from '../../config/constants';
import { getNextTier } from '../../utils/tierLogic';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import FileUpload from '../../components/ui/FileUpload';
import Badge from '../../components/ui/Badge';

/**
 * Upgrade page component.
 */
export default function Upgrade() {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [screenshot, setScreenshot] = useState(null);

  const currentTier = userData?.tier;
  const nextTier = getNextTier(currentTier);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(upgradeSchema),
  });

  /**
   * Handles upgrade request submission.
   * @param {Object} data - Form data.
   */
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const proofUpload = await uploadUpgradeProof(screenshot, user.uid);

      await addDocument(COLLECTIONS.UPGRADE_REQUESTS, {
        uid: user.uid,
        email: user.email,
        currentTier,
        newFollowerCount: data.newFollowerCount,
        newProfileLink: data.newProfileLink,
        newScreenshotUrl: proofUpload.downloadUrl,
        status: 'pending',
        createdAt: new Date(),
      });

      toast.success('Upgrade request submitted! An admin will review your new follower count.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!nextTier) {
    return (
      <div className="dashboard-page">
        <PageHeader
          title="Upgrade Account"
          subtitle="Request a tier upgrade"
          icon={<FaArrowUpRightDots />}
        />
        <Card>
          <CardBody>
            <div className="upgrade-maxed">
              <Badge variant="success">You are already at the highest tier ({currentTier})</Badge>
              <p>You can see all tasks in the {currentTier} tier for your platform.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Upgrade Account"
        subtitle={`Upgrade from ${currentTier} to ${nextTier} tier`}
        icon={<FaArrowUpRightDots />}
      />

      <div className="upgrade-layout">
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Request</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="form-stack">
              <div className="upgrade-info-banner">
                <strong>Current Tier: {currentTier}</strong>
                <span>Next Tier: {nextTier} (min {TIER_MIN_FOLLOWERS[nextTier].toLocaleString()} followers)</span>
              </div>

              <Input
                label="New Follower Count"
                type="number"
                placeholder={`Minimum ${TIER_MIN_FOLLOWERS[nextTier].toLocaleString()} for ${nextTier}`}
                icon={<FaUsers />}
                error={errors.newFollowerCount?.message}
                {...register('newFollowerCount', { valueAsNumber: true })}
              />

              <Input
                label="New Profile Link"
                type="url"
                placeholder="https://..."
                icon={<FaLink />}
                error={errors.newProfileLink?.message}
                {...register('newProfileLink')}
              />

              <FileUpload
                label="Upload New Screenshot Showing Followers"
                accept="image/*"
                onChange={(files) => setScreenshot(files[0])}
                error={errors.newScreenshot?.message}
                helperText="Screenshot must clearly show your new follower count"
              />

              <Button type="submit" fullWidth loading={loading}>
                <FaArrowUpRightDots /> Submit Upgrade Request
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upgrade Information</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="info-list">
              <div className="info-item">
                <strong>What happens after approval?</strong>
