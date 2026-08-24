/**
 * LETCON - Transactions Page
 * Full transaction history for the earner.
 */
import { FaArrowRightFromBracket, FaCircleCheck, FaClock } from 'react-icons/fa6';
import { useWallet } from '../../contexts/WalletContext';
import { formatNaira, formatDateTime } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

/**
 * Gets badge variant for transaction type.
 * @param {string} type - Transaction type.
 * @returns {string} Badge variant.
 */
