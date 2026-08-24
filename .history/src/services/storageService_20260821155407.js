/**
 * LETCON - Storage Service (Cloudinary)
 * File uploads via Cloudinary's free tier - no Firebase Storage required.
 * Supports images, videos, and any file type with unsigned uploads.
 */
import { STORAGE_PATHS } from '../config/constants';
import { validateImageFile, validateVideoFile } from '../utils/validators';

/** Cloudinary configuration from environment */
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

/**
 * Checks if Cloudinary is configured.
 * @returns {boolean} True if configured.
 */
export function isCloudinaryConfigured() {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);
}

/**
 * Uploads a file to Cloudinary.
 * @param {File} file - The file to upload.
 * @param {string} folder - The storage folder (used as Cloudinary folder/tag).
 * @param {string} uid - The user ID (used for tagging).
 * @param {Function} [onProgress] - Progress callback (0-100).
 * @returns {Promise<Object>} Object with downloadUrl and path.
 */
export async function uploadFile(file, folder, uid, onProgress) {
  if (!file) throw new Error('No file provided');

  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to .env');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', `letcon/${folder}`);
  formData.append('tags', `letcon,${folder},${uid}`);

  try {
    // Use XMLHttpRequest for progress tracking
    const result = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            reject(new Error('Invalid response from Cloudinary'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.error?.message || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.ontimeout = () => reject(new Error('Upload timed out'));

      xhr.open('POST', CLOUDINARY_UPLOAD_URL);
      xhr.timeout = 120000; // 2 minute timeout
      xhr.send(formData);
    });

    return {
      downloadUrl: result.secure_url,
      path: result.public_id,
      name: file.name,
      size: file.size,
      type: file.type,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error('[LETCON] Cloudinary upload error:', error);
    throw new Error(error.message || 'Failed to upload file. Please try again.');
  }
}

/**
 * Uploads an image file with validation.
 * @param {File} file - The image file.
 * @param {string} folder - The storage folder.
 * @param {string} uid - The user ID.
 * @param {Function} [onProgress] - Progress callback.
 * @returns {Promise<Object>} Upload result.
 */
export async function uploadImage(file, folder, uid, onProgress) {
  const validation = validateImageFile(file);
  if (!validation.valid) throw new Error(validation.error);
  return uploadFile(file, folder, uid, onProgress);
}

/**
 * Uploads a video file with validation.
 * @param {File} file - The video file.
 * @param {string} folder - The storage folder.
 * @param {string} uid - The user ID.
 * @param {Function} [onProgress] - Progress callback.
 * @returns {Promise<Object>} Upload result.
 */
export async function uploadVideo(file, folder, uid, onProgress) {
  const validation = validateVideoFile(file);
  if (!validation.valid) throw new Error(validation.error);
  return uploadFile(file, folder, uid, onProgress);
}

/**
 * Uploads multiple files.
 * @param {Array<File>} files - Array of files to upload.
 * @param {string} folder - The storage folder.
 * @param {string} uid - The user ID.
 * @param {Function} [onProgress] - Progress callback (overall 0-100).
 * @returns {Promise<Array<Object>>} Array of upload results.
 */
export async function uploadMultipleFiles(files, folder, uid, onProgress) {
  const results = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i];
    const result = await uploadFile(file, folder, uid, (fileProgress) => {
      const overallProgress = ((i + fileProgress / 100) / total) * 100;
      onProgress?.(overallProgress);
    });
    results.push(result);
  }

  return results;
}

/**
 * Deletes a file from Cloudinary.
 * Note: Unsigned uploads cannot delete files directly.
 * Files are tagged and can be managed via Cloudinary dashboard.
 * @param {string} path - The public ID of the file.
 * @returns {Promise<void>}
 */
export async function deleteFile(path) {
  // Cloudinary unsigned uploads cannot delete files from client-side.
  // Files can be managed via Cloudinary dashboard or with signed API calls.
  console.log('[LETCON] File deletion requested for:', path);
  console.log('[LETCON] Note: Delete files via Cloudinary dashboard for unsigned uploads.');
  // We don't throw an error to avoid breaking existing flows
}

/**
 * Gets the download URL for a file.
 * @param {string} path - The public ID or URL of the file.
 * @returns {Promise<string>} The download URL.
 */
export async function getFileUrl(path) {
  // If it's already a URL, return it
  if (path?.startsWith('http')) {
    return path;
  }
  // Otherwise, construct the Cloudinary URL
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${path}`;
}

/**
 * Lists all files in a folder.
 * Note: Requires signed API call - not available with unsigned uploads.
 * @param {string} folder - The storage folder.
 * @returns {Promise<Array<Object>>} Array of file references.
 */
export async function listFiles(folder) {
  console.log('[LETCON] listFiles is not supported with unsigned Cloudinary uploads');
  return [];
}

/**
 * Convenience upload helpers for specific use cases.
 */
export const uploadVerificationProof = (file, uid, onProgress) =>
  uploadImage(file, STORAGE_PATHS.VERIFICATION_PROOFS, uid, onProgress);

export const uploadTaskMedia = (file, uid, onProgress) =>
  uploadFile(file, STORAGE_PATHS.TASK_MEDIA, uid, onProgress);

export const uploadTaskProof = (file, uid, onProgress) =>
  uploadFile(file, STORAGE_PATHS.TASK_PROOFS, uid, onProgress);

export const uploadProfilePicture = (file, uid, onProgress) =>
  uploadImage(file, STORAGE_PATHS.PROFILE_PICTURES, uid, onProgress);

export const uploadUpgradeProof = (file, uid, onProgress) =>
  uploadImage(file, STORAGE_PATHS.UPGRADE_PROOFS, uid, onProgress);

export const uploadAccountChangeProof = (file, uid, onProgress) =>
  uploadImage(file, STORAGE_PATHS.ACCOUNT_CHANGE_PROOFS, uid, onProgress);

export const uploadMessageAttachment = (file, uid, onProgress) =>
  uploadFile(file, STORAGE_PATHS.MESSAGE_ATTACHMENTS, uid, onProgress);