/**
 * LETCON - Account Change Request Page
 * Request to change the verified promotion account (platform/username).
 * The existing verified account remains active until admin approval.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FaArrowRightArrowLeft, FaHashtag, FaLink, FaUsers, FaShieldHalved } from 'react-icons/fa6';
import { accountChangeSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';
import { uploadAccountChangeProof } from '../../services/storageService';
import { addDocument } from '../../services/firestoreService';
import { COLLECTIONS, PLATFORM_LIST } from '../../config/constants';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import FileUpload from '../../components/ui/FileUpload';
import PlatformBadge from '../../components/shared/PlatformBadge';

const PLATFORM_OPTIONS = PLATFORM_LIST.map((platform) => ({ value: platform, label: platform }));

/**
 * Account change request page component.
 */
export default function AccountChange() {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);
