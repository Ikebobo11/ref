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
      const isVideo = file.type.startsWith('video/');
      const validation = isImage ? validateImageFile(file) : isVideo ? validateVideoFile(file) : { valid: false, error: 'Unsupported file type' };

      if (validation.valid) {
        validFiles.push(file);
      }
    });

    const newFiles = multiple ? [...files, ...validFiles] : validFiles.slice(0, 1);
    setFiles(newFiles);
    onChange?.(newFiles);
  }, [files, multiple, onChange]);

  /**
   * Handles file input change.
   * @param {Event} e - The change event.
   */
  const handleChange = (e) => {
    processFiles(e.target.files);
    e.target.value = '';
  };

  /**
   * Handles drag events.
   * @param {Event} e - The drag event.
   */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  /**
   * Handles file drop.
   * @param {Event} e - The drop event.
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      processFiles(e.dataTransfer.files);
    }
  };

  /**
   * Removes a file from the list.
   * @param {number} index - The file index.
   */
  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onChange?.(newFiles);
  };

  return (
    <div className={`file-upload ${className}`}>
      <div
        className={`file-upload-dropzone ${dragActive ? 'drag-active' : ''} ${error ? 'input-error' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <FaCloudUploadAlt className="file-upload-icon" />
        <p className="file-upload-text">{label}</p>
        <p className="file-upload-hint">Drag and drop or click to browse</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="file-upload-input"
          hidden
        />
      </div>

      {files.length > 0 && (
        <div className="file-upload-list">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="file-upload-item">
              <FaFile className="file-upload-item-icon" />
              <div className="file-upload-item-info">
                <span className="file-upload-item-name">{file.name}</span>
                <span className="file-upload-item-size">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <button
                type="button"
                className="file-upload-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                aria-label="Remove file"
              >
                <FaXmark />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <span className="form-error">{error}</span>}
      {!error && helperText && <span className="form-helper">{helperText}</span>}
    </div>
  );
}