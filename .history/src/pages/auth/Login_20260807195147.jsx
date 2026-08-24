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
