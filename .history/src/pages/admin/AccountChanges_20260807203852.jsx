/**
 * LETCON - Account Changes Page
 * Admin approves or rejects earner account change requests.
 * Full audit history: previous account, requested account, decision, admin, timestamp.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaArrowRightArrowLeft, FaCircleCheck, FaCircleXmark, FaExternalLink } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
