/**
 * LETCON - Account Changes Page (Super Admin)
 * Review earner account change requests: approve or reject.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaUserPlus, FaCircleCheck, FaXmark, FaArrowRightArrowLeft } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { approveAccountChange, rejectAccountChange } from '../../services/adminService';
import { COLLECTIONS } from '../../config/constants';
import { formatDate, formatNumber } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
