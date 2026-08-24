/**
 * LETCON - Upgrades Page
 * Admin approves or rejects earner tier upgrade requests.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaArrowUpRightDots, FaCircleCheck, FaCircleXmark, FaExternalLink } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { approveUpgrade, rejectUpgrade } from '../../services/adminService';
import { COLLECTIONS, UPGRADE_STATUS } from '../../config/constants';
