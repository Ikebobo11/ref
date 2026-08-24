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
