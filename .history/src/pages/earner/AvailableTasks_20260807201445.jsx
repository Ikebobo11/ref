/**
 * LETCON - Available Tasks Page
 * Shows tasks matching the earner's tier AND verified platform.
 * Dual restriction enforced via Firestore query filters.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaListCheck, FaLocationDot, FaUsers, FaClock } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
