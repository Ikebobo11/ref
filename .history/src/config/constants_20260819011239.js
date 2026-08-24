/**
 * LETCON - Core Business Constants (FALLBACK DEFAULTS)
 * These are the default values used when no Firestore settings document exists.
 * Super admins can override ALL of these values via the Settings page in the app.
 * The app will load settings from Firestore `settings/platform` document first,
 * and fall back to these constants only if that document doesn't exist.
 *
 * To change any value without editing code:
 *   Go to Super Admin > Settings in the app and update the values there.
 */

/** Supported social media platforms */
export const PLATFORMS = {
  TIKTOK: 'TikTok',
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
  SNAPCHAT: 'Snapchat',
  YOUTUBE: 'YouTube',
  X: 'X',
};

/** All supported platforms as an array */
export const PLATFORM_LIST = Object.values(PLATFORMS);

/** Follower tiers */
export const TIERS = {
  TIER_1: '5K',
  TIER_2: '10K',
  TIER_3: '15K',
};

/** All tiers as an array */
export const TIER_LIST = [TIERS.TIER_1, TIERS.TIER_2, TIERS.TIER_3];

/** Minimum followers required for each tier */
export const TIER_MIN_FOLLOWERS = {
  [TIERS.TIER_1]: 5000,
  [TIERS.TIER_2]: 10000,
  [TIERS.TIER_3]: 15000,
};

/**
 * Payment rates per tier and platform (₦)
 * Tier 1: TikTok/Facebook/Snapchat ₦12,000 | Instagram/YouTube/X ₦18,000
 * Tier 2: TikTok/Facebook/Snapchat ₦26,000 | Instagram/YouTube/X ₦32,000
 * Tier 3: TikTok/Facebook/Snapchat ₦38,000 | Instagram/YouTube/X ₦46,000
 */
export const TIER_PAYMENTS = {
  [TIERS.TIER_1]: {
    [PLATFORMS.TIKTOK]: 12000,
    [PLATFORMS.FACEBOOK]: 12000,
    [PLATFORMS.SNAPCHAT]: 12000,
    [PLATFORMS.INSTAGRAM]: 18000,
    [PLATFORMS.YOUTUBE]: 18000,
    [PLATFORMS.X]: 18000,
  },
  [TIERS.TIER_2]: {
    [PLATFORMS.TIKTOK]: 26000,
    [PLATFORMS.FACEBOOK]: 26000,
    [PLATFORMS.SNAPCHAT]: 26000,
    [PLATFORMS.INSTAGRAM]: 32000,
    [PLATFORMS.YOUTUBE]: 32000,
    [PLATFORMS.X]: 32000,
  },
  [TIERS.TIER_3]: {
    [PLATFORMS.TIKTOK]: 38000,
    [PLATFORMS.FACEBOOK]: 38000,
    [PLATFORMS.SNAPCHAT]: 38000,
    [PLATFORMS.INSTAGRAM]: 46000,
    [PLATFORMS.YOUTUBE]: 46000,
    [PLATFORMS.X]: 46000,
  },
};

/** Platform revenue split percentages */
export const REVENUE_SPLIT = {
  PLATFORM_PERCENT: 30,
  EARNER_PERCENT: 70,
};

/** Fees (₦) */
export const FEES = {
  VERIFICATION_FEE: 1000,
  TASK_POSTING_FEE: 1000,
};

/** Auto-approval window (24 hours in milliseconds) */
export const AUTO_APPROVAL_HOURS = 24;
export const AUTO_APPROVAL_MS = AUTO_APPROVAL_HOURS * 60 * 60 * 1000;

/** User roles */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  ADVERTISER: 'advertiser',
  EARNER: 'earner',
};

/** Task statuses */
export const TASK_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PENDING_ADMIN_REVIEW: 'pending_admin_review',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  FLAGGED: 'flagged',
};

/** Verification request statuses */
export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

/** Upgrade request statuses */
export const UPGRADE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

/** Account change request statuses */
export const ACCOUNT_CHANGE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

/** Transaction types */
export const TRANSACTION_TYPES = {
  WALLET_FUNDING: 'wallet_funding',
  TASK_POSTING_FEE: 'task_posting_fee',
  VERIFICATION_FEE: 'verification_fee',
  TASK_PAYMENT: 'task_payment',
  PLATFORM_REVENUE: 'platform_revenue',
  WITHDRAWAL: 'withdrawal',
  REFUND: 'refund',
};

/** Transaction statuses */
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
};

/** Withdrawal statuses */
export const WITHDRAWAL_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

/** Notification types */
export const NOTIFICATION_TYPES = {
  TASK_APPROVED: 'task_approved',
  TASK_REJECTED: 'task_rejected',
  TASK_ACCEPTED: 'task_accepted',
  WALLET_CREDITED: 'wallet_credited',
  WITHDRAWAL_SUCCESSFUL: 'withdrawal_successful',
  VERIFICATION_APPROVED: 'verification_approved',
  VERIFICATION_REJECTED: 'verification_rejected',
  NEW_TASK_AVAILABLE: 'new_task_available',
  ACCOUNT_CHANGE_APPROVED: 'account_change_approved',
  ACCOUNT_CHANGE_REJECTED: 'account_change_rejected',
  ACCOUNT_MISMATCH_FLAGGED: 'account_mismatch_flagged',
  UPGRADE_APPROVED: 'upgrade_approved',
  UPGRADE_REJECTED: 'upgrade_rejected',
  TASK_SUBMITTED: 'task_submitted',
/** Conversation types */
export const CONVERSATION_TYPES = {
  DIRECT: 'direct',
  SUPPORT: 'support',
  ADMIN_SUPERADMIN: 'admin_superadmin',
};

/** Countries supported */
export const COUNTRIES = [
  'Nigeria',
  'Ghana',
  'Kenya',
  'South Africa',
  'United Kingdom',
  'United States',
  'Canada',
  'India',
  'Other',
];

/** Currency */
export const CURRENCY = 'NGN';
export const CURRENCY_SYMBOL = '₦';

/** App metadata */
export const APP_NAME = 'LETCON';
export const APP_TAGLINE = 'Micro Influencer Marketplace';

/** Storage paths */
export const STORAGE_PATHS = {
  VERIFICATION_PROOFS: 'verification-proofs',
  TASK_MEDIA: 'task-media',
  TASK_PROOFS: 'task-proofs',
  PROFILE_PICTURES: 'profile-pictures',
  UPGRADE_PROOFS: 'upgrade-proofs',
  ACCOUNT_CHANGE_PROOFS: 'account-change-proofs',
};

/** Firestore collection names */
export const COLLECTIONS = {
  USERS: 'users',
  ADMINS: 'admins',
  ADVERTISERS: 'advertisers',
  EARNERS: 'earners',
  TASKS: 'tasks',
  CAMPAIGNS: 'campaigns',
  WALLETS: 'wallets',
  TRANSACTIONS: 'transactions',
  WITHDRAWALS: 'withdrawals',
  NOTIFICATIONS: 'notifications',
  MESSAGES: 'messages',
  VERIFICATION_REQUESTS: 'verificationRequests',
  UPGRADE_REQUESTS: 'upgradeRequests',
  ACCOUNT_CHANGE_REQUESTS: 'accountChangeRequests',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  AUDIT_LOGS: 'auditLogs',
  DISPUTES: 'disputes',
};

/** Query limits */
export const QUERY_LIMITS = {
  DEFAULT: 20,
  LARGE: 50,
  MAX: 100,
};

/** File upload limits */
export const UPLOAD_LIMITS = {
  MAX_IMAGE_SIZE_MB: 5,
  MAX_VIDEO_SIZE_MB: 50,
  MAX_IMAGES_PER_TASK: 5,
  MAX_VIDEOS_PER_TASK: 2,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
};

/** Pagination defaults */
export const PAGINATION = {
  PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50],
};