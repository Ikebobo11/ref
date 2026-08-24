/**
 * LETCON - ChatThread Component
 * Displays a thread of messages with attachment support.
 */
import { useEffect, useRef } from 'react';
import { FaFile, FaDownload } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { formatRelativeTime } from '../../utils/formatters';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';
import ChatComposer from './ChatComposer';

/**
 * ChatThread component.
 * @param {Object} props - Component props.
