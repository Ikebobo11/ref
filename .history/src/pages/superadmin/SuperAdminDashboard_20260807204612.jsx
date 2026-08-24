/**
 * LETCON - Super Admin Dashboard Page
 * Platform-wide overview with revenue, users, and task statistics.
 */
import { Link } from 'react-router-dom';
import {
  FaWallet,
  FaUsers,
  FaBullhorn,
  FaCircleCheck,
  FaUserShield,
  FaArrowUpRightDots,
  FaScroll,
} from 'react-icons/fa6';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
