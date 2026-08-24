/**
 * LETCON - Account Change Request Page
 * Request to change the verified promotion account (platform/username).
 * The existing verified account remains active until admin approval.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FaArrowRightArrowLeft, FaHashtag, FaLink, FaUsers, FaShieldHalved } from 'react-icons/fa6';
import { accountChangeSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';
import { uploadAccountChangeProof } from '../../services/storageService';
import { addDocument } from '../../services/firestoreService';
import { COLLECTIONS, PLATFORM_LIST } from '../../config/constants';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import FileUpload from '../../components/ui/FileUpload';
import PlatformBadge from '../../components/shared/PlatformBadge';

const PLATFORM_OPTIONS = PLATFORM_LIST.map((platform) => ({ value: platform, label: platform }));

/**
 * Account change request page component.
 */
export default function AccountChange() {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [screenshot, setScreenshot] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(accountChangeSchema),
  });

  const newPlatform = watch('newPlatform');

  /**
   * Handles account change request submission.
   * @param {Object} data - Form data.
   */
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const proofUpload = await uploadAccountChangeProof(screenshot, user.uid);

      await addDocument(COLLECTIONS.ACCOUNT_CHANGE_REQUESTS, {
        uid: user.uid,
        email: user.email,
        previousPlatform: userData?.verifiedPlatform,
        previousUsername: userData?.verifiedUsername,
        previousProfileUrl: userData?.profileUrl,
        newPlatform: data.newPlatform,
        newUsername: data.newUsername,
        newProfileUrl: data.newProfileUrl,
        newFollowerCount: data.newFollowerCount,
        newScreenshotUrl: proofUpload.downloadUrl,
        reason: data.reason,
        status: 'pending',
        createdAt: new Date(),
      });

      toast.success('Account change request submitted! Your current verified account remains active until approved.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Request Account Change"
        subtitle="Change your verified promotion account (platform or username)"
        icon={<FaArrowRightArrowLeft />}
      />

      <div className="account-change-layout">
        <Card>
          <CardHeader>
            <CardTitle>Current Verified Account</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="current-account-display">
              <div className="current-account-platform">
                <PlatformBadge platform={userData?.verifiedPlatform} size="lg" />
              </div>
              <div className="current-account-details">
                <div className="verified-account-row">
                  <span className="label">Username</span>
                  <span className="value">@{userData?.verifiedUsername || 'N/A'}</span>
                </div>
                <div className="verified-account-row">
                  <span className="label">Profile URL</span>
                  <span className="value">{userData?.profileUrl || 'N/A'}</span>
                </div>
                <div className="verified-account-row">
                  <span className="label">Followers</span>
                  <span className="value">{userData?.followerCount?.toLocaleString() || 'N/A'}</span>
                </div>
              </div>
              <div className="current-account-note">
                <FaShieldHalved />
                <span>This account remains active until your change request is approved.</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Account Details</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="form-stack">
              <Select
                label="New Platform"
                options={PLATFORM_OPTIONS}
                error={errors.newPlatform?.message}
                {...register('newPlatform')}
              />

              {newPlatform && (
                <div className="selected-platform-preview">
                  <PlatformBadge platform={newPlatform} size="lg" />
                </div>
              )}

              <Input
                label="New Username"
                placeholder="e.g., newusername"
                icon={<FaHashtag />}
                error={errors.newUsername?.message}
                {...register('newUsername')}
              />

              <Input
                label="New Profile URL"
                type="url"
                placeholder="https://..."
                icon={<FaLink />}
                error={errors.newProfileUrl?.message}
                {...register('newProfileUrl')}
              />

              <Input
                label="New Follower Count"
                type="number"
                placeholder="e.g., 5000"
                icon={<FaUsers />}
                error={errors.newFollowerCount?.message}
                {...register('newFollowerCount', { valueAsNumber: true })}
              />

              <FileUpload
                label="Upload Updated Follower Screenshot"
                accept="image/*"
                onChange={(files) => setScreenshot(files[0])}
                error={errors.newFollowerScreenshot?.message}
                helperText="Screenshot must clearly show your follower count"
              />

              <Input
                label="Reason for Change"
                type="text"
                placeholder="Why are you changing your account?"
                error={errors.reason?.message}
                {...register('reason')}
              />

              <Button type="submit" fullWidth loading={loading}>
                <FaArrowRightArrowLeft /> Submit Change Request
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}