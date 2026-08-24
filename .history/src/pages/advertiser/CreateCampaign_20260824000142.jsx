/**
 * LETCON - Create Campaign Page
 * Advertiser task creation with platform, tier, budget, and media uploads.
 * Includes the task posting fee (deducted from wallet balance).
 * Gender-specific campaigns use a higher posting fee (configurable in settings).
 */
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FaCirclePlus, FaCreditCard, FaBullhorn } from 'react-icons/fa6';
import { taskSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';
import { useSettings } from '../../contexts/SettingsContext';
import { createTask, publishTask } from '../../services/taskService';
import { uploadTaskMedia } from '../../services/storageService';
import { deductCampaignBudget, deductPostingFee } from '../../services/walletService';
import { PLATFORM_LIST, TIER_LIST, COUNTRIES, FEES, CURRENCY_SYMBOL } from '../../config/constants';
import { getTierPayment } from '../../utils/tierLogic';
import { formatNaira } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import FileUpload from '../../components/ui/FileUpload';
import PlatformBadge from '../../components/shared/PlatformBadge';

const PLATFORM_OPTIONS = PLATFORM_LIST.map((p) => ({ value: p, label: p }));
const TIER_OPTIONS = TIER_LIST.map((t) => ({ value: t, label: `${t} followers` }));
const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c, label: c }));
const GENDER_OPTIONS = [
  { value: 'any', label: 'Any Gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

/**
 * Create campaign page component.
 */

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
  });

  const platform = watch('platform');
  const followerTier = watch('followerTier');
  const influencersNeeded = watch('influencersNeeded');
  const paymentPerInfluencer = getTierPayment(followerTier, platform);
  const [totalPrice, setTotalPrice] = useState(0);

  // Calculate total price when followerTier or influencersNeeded changes
  useEffect(() => {
    if (paymentPerInfluencer && influencersNeeded) {
      setTotalPrice(paymentPerInfluencer * influencersNeeded);
    } else {
      setTotalPrice(0);
    }
  }, [paymentPerInfluencer, influencersNeeded]);

  /**
   * Handles campaign creation with posting fee deducted from wallet balance.
   * @param {Object} data - Form data.
   */
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Upload media files in parallel for speed
      const [uploadedImages, uploadedVideos, exampleUrl] = await Promise.all([
        Promise.all(images.map((file) => uploadTaskMedia(file, user.uid).then((u) => u.downloadUrl))),
        Promise.all(videos.map((file) => uploadTaskMedia(file, user.uid).then((u) => u.downloadUrl))),
        example ? uploadTaskMedia(example, user.uid).then((u) => u.downloadUrl) : Promise.resolve(null),
      ]);

      // Check wallet balance before creating the task (budget + posting fee combined)
      const totalRequired = totalPrice + FEES.TASK_POSTING_FEE;
      if ((wallet?.balance ?? 0) < totalRequired) {
        toast.error(`Insufficient wallet balance. You need ${formatNaira(totalRequired)} (campaign budget + posting fee) to publish this campaign. Please fund your wallet first.`);
        setLoading(false);
        return;
      }

      // Create the task
      const task = await createTask({
        advertiserId: user.uid,
        platform: data.platform,
        title: data.title,
        instructions: data.instructions,
        link: data.link,
        hashtags: data.hashtags,
        country: data.country,
        influencersNeeded: data.influencersNeeded,
        followerTier: data.followerTier,
        budget: totalPrice, // Use auto-calculated total price
        images: uploadedImages,
        videos: uploadedVideos,
        example: exampleUrl,
      });

      // Deduct the campaign budget from the advertiser's wallet
      await deductCampaignBudget({
        uid: user.uid,
        amount: totalPrice,
        taskId: task.id,
      });

      // Deduct the posting fee from the advertiser's wallet
      await deductPostingFee({
        uid: user.uid,
        amount: FEES.TASK_POSTING_FEE,
        taskId: task.id,
      });

      // Publish the task
      await publishTask(task.id);
      toast.success('Campaign published successfully!');
      refreshWallet();
    } catch (error) {
      console.error('[LETCON] Campaign creation error:', error);
      toast.error(error.message || 'Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Create Campaign"
        subtitle="Publish a new promotional task for micro influencers"
        icon={<FaCirclePlus />}
      />

      <div className="create-campaign-layout">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="form-stack">
              <Select
                label="Platform"
                options={PLATFORM_OPTIONS}
                error={errors.platform?.message}
                {...register('platform')}
              />

              {platform && (
                <div className="selected-platform-preview">
                  <PlatformBadge platform={platform} size="lg" />
                </div>
              )}

              <Input
                label="Task Title"
                placeholder="e.g., Promote our new product launch"
                error={errors.title?.message}
                {...register('title')}
              />

              <Input
                label="Instructions / Script"
                placeholder="Detailed step-by-step instructions or script for completing the task"
                error={errors.instructions?.message}
                {...register('instructions')}
              />

              <Input
                label="Songlink / Post Link"
                placeholder="https://song.link/... or https://..."
                error={errors.link?.message}
                {...register('link')}
              />

              <div className="form-row">
                <Select
                  label="Country"
                  options={COUNTRY_OPTIONS}
                  error={errors.country?.message}
                  {...register('country')}
                />
                <Select
                  label="Follower Tier"
                  options={TIER_OPTIONS}
                  error={errors.followerTier?.message}
                  {...register('followerTier')}
                />
              </div>

              <Input
                label="Influencers Needed"
                type="number"
                placeholder="e.g., 5"
                error={errors.influencersNeeded?.message}
                {...register('influencersNeeded', { valueAsNumber: true })}
              />

              <div className="payment-preview">
                <span>Payment per influencer: <strong>{formatNaira(paymentPerInfluencer)}</strong></span>
                <span>Total campaign price: <strong>{formatNaira(totalPrice)}</strong></span>
                <span>Platform keeps 30%: {formatNaira(Math.round(totalPrice * 0.3))}</span>
                <span>Earner receives 70%: {formatNaira(Math.round(totalPrice * 0.7))}</span>
                <span>Posting fee: {formatNaira(FEES.TASK_POSTING_FEE)}</span>
                <span>Total to deduct from wallet: <strong>{formatNaira(totalPrice + FEES.TASK_POSTING_FEE)}</strong></span>
              </div>

              <FileUpload
                label="Upload Files"
                accept="*/*"
                onChange={setImages}
                helperText="Accepts images, videos, or any file type"
              />

              <div className="posting-fee-note">
                <FaCreditCard />
                <div>
                  <strong>Task Posting Fee: {CURRENCY_SYMBOL}{FEES.TASK_POSTING_FEE.toLocaleString()}</strong>
                  <p>Non-refundable. Deducted from your wallet balance.</p>
                </div>
              </div>

              <Button type="submit" fullWidth loading={loading}>
                <FaBullhorn /> Create & Publish Campaign
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}