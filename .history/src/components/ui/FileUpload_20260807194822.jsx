/**
 * LETCON - FileUpload Component
 * Reusable file upload with drag-and-drop, preview, and validation.
 */
import { useRef, useState, useCallback } from 'react';
import { FaCloudUploadAlt, FaXmark, FaFile } from 'react-icons/fa6';
import { validateImageFile, validateVideoFile } from '../../utils/validators';

/**
