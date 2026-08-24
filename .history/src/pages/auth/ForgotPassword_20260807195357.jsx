/**
 * LETCON - Forgot Password Page
 * Sends a password reset email.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FaEnvelope, FaPaperPlane } from 'react-icons/fa6';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../components/shared/Logo';


