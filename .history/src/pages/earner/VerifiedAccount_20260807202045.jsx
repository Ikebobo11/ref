/**
 * LETCON - Verified Account Page
 * Displays the earner's Verified Promotion Account details.
 */
import { Link } from 'react-router-dom';
import { FaShieldHalved, FaArrowRightArrowLeft, FaArrowUpRightDots, FaExternalLink } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { formatNumber, formatDate } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import PlatformBadge from '../../components/shared/PlatformBadge';

/**
 * Verified account page component.
 */
export default function VerifiedAccount() {
  const { userData } = useAuth();

  const verified = userData?.verified;
  const statusVariant = verified ? 'success' : 'warning';
  const statusText = verified ? 'Verified' : 'Pending Verification';

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Verified Promotion Account"
        subtitle="The single account permanently tied to your earner profile"
        icon={<FaShieldHalved />}
      />

      <Card className="verified-account-card">
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <Badge variant={statusVariant}>{statusText}</Badge>
        </CardHeader>
        <CardBody>
          <div className="verified-account-hero">
            <div className="verified-account-hero-icon">
              <FaShieldHalved />
            </div>
            <div className="verified-account-hero-info">
              <PlatformBadge platform={userData?.verifiedPlatform} size="lg" />
              <h3>@{userData?.verifiedUsername || 'N/A'}</h3>
              {userData?.profileUrl && (
                <a href={userData.profileUrl} target="_blank" rel="noopener noreferrer" className="profile-link">
                  <FaExternalLink /> {userData.profileUrl}
                </a>
              )}
            </div>
          </div>

          <div className="verified-account-details-grid">
            <div className="verified-account-detail-item">
              <span className="label">Verified Platform</span>
              <span className="value">{userData?.verifiedPlatform || 'N/A'}</span>
            </div>
            <div className="verified-account-detail-item">
              <span className="label">Verified Username</span>
              <span className="value">@{userData?.verifiedUsername || 'N/A'}</span>
            </div>
            <div className="verified-account-detail-item">
              <span className="label">Profile Link</span>
              <span className="value">{userData?.profileUrl || 'N/A'}</span>
            </div>
            <div className="verified-account-detail-item">
              <span className="label">Current Tier</span>
              <span className="value">{userData?.tier || 'N/A'}</span>
            </div>
            <div className="verified-account-detail-item">
              <span className="label">Follower Count</span>
              <span className="value">{formatNumber(userData?.followerCount ?? 0)}</span>
            </div>
            <div className="verified-account-detail-item">
