/**
 * LETCON - Users Page
 * Admin manages users: view, suspend, and ban accounts.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaUsers, FaBan, FaPlay, FaTriangleExclamation } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
