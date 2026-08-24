/**
 * LETCON - ChatComposer Component
 * Reusable message input with file attachment support.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaPaperclip, FaXmark, FaFile, FaPaperPlane } from 'react-icons/fa6';
import Button from '../ui/Button';

/**
 * ChatComposer component.
 * @param {Object} props - Component props.
 * @param {Function} props.onSend - Send callback (content, attachment).
