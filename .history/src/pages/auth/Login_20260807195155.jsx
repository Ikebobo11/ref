/**
 * LETCON - Login Page
 * User authentication with email and password.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaRightToBracket } from 'react-icons/fa6';
import { loginSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../config/constants';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../components/shared/Logo';

/**
 * Login page component.
 */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });


