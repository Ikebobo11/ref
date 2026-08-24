/**
 * LETCON - FileUpload Component
 * Reusable file upload with drag-and-drop, preview, and validation.
 */
import { useRef, useState, useCallback } from 'react';
import { FaCloudUploadAlt, FaXmark, FaFile } from 'react-icons/fa6';
import { validateImageFile, validateVideoFile } from '../../utils/validators';

/**
 * FileUpload component.
 * @param {Object} props - Component props.
 * @param {string} [props.label] - Upload label.
 * @param {string} [props.accept] - Accepted file types.
 * @param {boolean} [props.multiple=false] - Allow multiple files.
 * @param {Function} props.onChange - Change handler with files array.
 * @param {string} [props.error] - Error message.
 * @param {string} [props.helperText] - Helper text.
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function FileUpload({
  label = 'Upload files',
  accept = 'image/*',
  multiple = false,
  onChange,
  error,
  helperText,
  className = '',
}) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  /**
   * Validates and processes selected files.
   * @param {FileList} fileList - The selected files.
   */
  const processFiles = useCallback((fileList) => {
    const selected = Array.from(fileList);
    const validFiles = [];

    selected.forEach((file) => {
      const isImage = file.type.startsWith('image/');
