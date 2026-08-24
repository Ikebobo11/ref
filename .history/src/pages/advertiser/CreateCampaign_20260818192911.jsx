/**
 * LETCON - Create Campaign Page
 * Advertiser task creation with platform, tier, budget, and media uploads.
 * Includes the ₦1,000 non-refundable task posting fee.
 */
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FaCirclePlus, FaCreditCard, FaBullhorn } from 'react-icons/fa6';
import { taskSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';
import { createTask, publishTask } from '../../services/taskService';
import { uploadTaskMedia } from '../../services/storageService';
import { generateReference, isPaystackConfigured } from '../../config/paystack';
import {
  createCheckoutHandler,
  recordTaskPostingFee,
  verifyTransaction,
} from '../../services/paystackService';
import { deductCampaignBudget } from '../../services/walletService';
import { updateDocument } from '../../services/firestoreService';
import { COLLECTIONS, PLATFORM_LIST, TIER_LIST, COUNTRIES, FEES, CURRENCY_SYMBOL } from '../../config/constants';
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

/**
 * Create campaign page component.
 */
export default function CreateCampaign() {
  const { user } = useAuth();
  const { wallet, refreshWallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [example, setExample] = useState(null);

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
   * Handles campaign creation with posting fee payment.
   * @param {Object} data - Form data.
   */
  const onSubmit = async (data) => {
    // Pre-check: verify Paystack is available before proceeding
    if (!isPaystackConfigured) {
      toast.error('Payment system is not configured. Please contact support.');
      return;
    }
    if (typeof window.PaystackPop === 'undefined') {
      toast.error('Payment system is still loading. Please refresh the page and try again.');
      return;
    }

    setLoading(true);
    try {
      // Upload media files in parallel for speed
      const [uploadedImages, uploadedVideos, exampleUrl] = await Promise.all([
        Promise.all(images.map((file) => uploadTaskMedia(file, user.uid).then((u) => u.downloadUrl))),
        Promise.all(videos.map((file) => uploadTaskMedia(file, user.uid).then((u) => u.downloadUrl))),
        example ? uploadTaskMedia(example, user.uid).then((u) => u.downloadUrl) : Promise.resolve(null),
      ]);

      // Check wallet balance before creating the task
      if ((wallet?.balance ?? 0) < totalPrice) {
        toast.error(`Insufficient wallet balance. You need ${formatNaira(totalPrice)} to publish this campaign. Please fund your wallet first.`);
        setLoading(false);
        return;
      }

      // Create the task
      const task = await createTask({
        advertiserId: user.uid,
        platform: data.platform,
        title: data.title,
        instructions: data.instructions,
        script: data.script,
        hashtags: data.hashtags,
        mentions: data.mentions,
        country: data.country,
        influencersNeeded: data.influencersNeeded,
        followerTier: data.followerTier,
        budget: totalPrice, // Use auto-calculated total price
        images: uploadedImages,
        videos: uploadedVideos,
        example: exampleUrl,
      });

      // Pay the posting fee
      const reference = generateReference('TASK');
      await recordTaskPostingFee({
        uid: user.uid,
        email: user.email,
        reference,
        taskId: task.id,
      });

      const handler = createCheckoutHandler({
        email: user.email,
        amount: FEES.TASK_POSTING_FEE,
        reference,
        onSuccess: async (response) => {
          try {
            // Verify the payment with Paystack
            const verification = await verifyTransaction(response.reference || reference);

            if (verification?.data?.status === 'success') {
              // Update transaction status
              await updateDocument(COLLECTIONS.TRANSACTIONS, reference, {
                status: 'success',
                paidAt: new Date(),
                paystackReference: response.reference,
              });

              // Deduct the campaign budget from the advertiser's wallet
              await deductCampaignBudget({
                uid: user.uid,
                amount: totalPrice,
                taskId: task.id,
              });

              // Publish the task
              await publishTask(task.id);
              toast.success('Campaign published successfully!');
              refreshWallet();
            } else {
              toast.error('Payment verification failed. Your campaign is saved as draft.');
            }
          } catch (error) {
            console.error('[LETCON] Posting fee payment error:', error);
            toast.error('Payment verification failed. Your campaign is saved as draft.');
          }
        },
        onCancel: () => {
          toast.error('Posting fee payment cancelled. Your campaign is saved as draft.');
        },
      });

      // Open the Paystack popup — reset loading so the button is free
      // while the user interacts with the payment modal
      setLoading(false);
      handler();
    } catch (error) {
      toast.error(error.message);
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
                label="Instructions"
                placeholder="Detailed step-by-step instructions for completing the task"
                error={errors.instructions?.message}
                {...register('instructions')}
              />

              <Input
                label="Script (Optional)"
                placeholder="Script for influencers to use in their content"
                error={errors.script?.message}
                {...register('script')}
              />

              <Input
                label="Hashtags (comma separated)"
                placeholder="#brand, #product, #promo"
                error={errors.hashtags?.message}
                {...register('hashtags')}
              />

              <Input
                label="Mentions (comma separated)"
                placeholder="@brand, @partner"
                error={errors.mentions?.message}
                {...register('mentions')}
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
                  <p>Non-refundable. Required to publish your campaign.</p>
                </div>
              </div>

              <Button type="submit" fullWidth loading={loading}>
                <FaBullhorn /> Create & Publish Campaign
              </Button>
            </form>
