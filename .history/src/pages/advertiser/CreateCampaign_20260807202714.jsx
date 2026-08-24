/**
 * LETCON - Create Campaign Page
 * Advertiser task creation with platform, tier, budget, and media uploads.
 * Includes the ₦1,000 non-refundable task posting fee.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FaPlusCircle, FaCreditCard, FaBullhorn } from 'react-icons/fa6';
import { taskSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';
import { createTask, publishTask } from '../../services/taskService';
import { uploadTaskMedia } from '../../services/storageService';
import { createCheckoutHandler, generateReference } from '../../config/paystack';
import { recordTaskPostingFee } from '../../services/paystackService';
import { COLLECTIONS, PLATFORM_LIST, TIER_LIST, COUNTRIES, FEES, CURRENCY_SYMBOL } from '../../config/constants';
import { getTierPayment } from '../../utils/tierLogic';
import { formatNaira } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
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
  const paymentPerInfluencer = getTierPayment(followerTier, platform);

  /**
   * Handles campaign creation with posting fee payment.
   * @param {Object} data - Form data.
   */
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Upload media files
      const uploadedImages = [];
      for (const file of images) {
        const upload = await uploadTaskMedia(file, user.uid);
        uploadedImages.push(upload.downloadUrl);
      }

      const uploadedVideos = [];
      for (const file of videos) {
        const upload = await uploadTaskMedia(file, user.uid);
        uploadedVideos.push(upload.downloadUrl);
      }

      let exampleUrl = null;
      if (example) {
        const upload = await uploadTaskMedia(example, user.uid);
        exampleUrl = upload.downloadUrl;
      }

      // Create the task
      const task = await createTask({
        advertiserId: user.uid,
        platform: data.platform,
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        script: data.script,
        hashtags: data.hashtags,
        mentions: data.mentions,
        deadline: data.deadline,
        country: data.country,
        influencersNeeded: data.influencersNeeded,
        followerTier: data.followerTier,
        budget: data.budget,
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
        onSuccess: async () => {
          await publishTask(task.id);
          toast.success('Campaign published successfully!');
          refreshWallet();
        },
        onCancel: () => toast.error('Posting fee payment cancelled. Your campaign is saved as draft.'),
      });

      handler();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Create Campaign"
        subtitle="Publish a new promotional task for micro influencers"
        icon={<FaPlusCircle />}
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

              <Textarea
                label="Description"
