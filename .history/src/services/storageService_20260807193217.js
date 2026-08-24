/**
 * LETCON - Storage Service
 * Firebase Storage operations for file uploads, downloads, and deletion.
 */
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';
import { storage } from '../config/firebase';
import { STORAGE_PATHS } from '../config/constants';
import { validateImageFile, validateVideoFile } from '../utils/validators';

/**
 * Generates a unique file path for storage.
 * @param {string} folder - The storage folder.
 * @param {string} uid - The user ID.
 * @param {File} file - The file to upload.
 * @returns {string} The storage path.
 */
function generateFilePath(folder, uid, file) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop() || 'bin';
  return `${folder}/${uid}/${timestamp}-${random}.${extension}`;
}

/**
 * Uploads a file to Firebase Storage.
 * @param {File} file - The file to upload.
 * @param {string} folder - The storage folder (use STORAGE_PATHS constants).
 * @param {string} uid - The user ID.
 * @param {Function} [onProgress] - Progress callback (0-100).
 * @returns {Promise<Object>} Object with downloadUrl and path.
 */
export async function uploadFile(file, folder, uid, onProgress) {
  if (!file) throw new Error('No file provided');

  const filePath = generateFilePath(folder, uid, file);
  const storageRef = ref(storage, filePath);

  try {
    const uploadTask = uploadBytesResumable(storageRef, file);

    if (onProgress) {
      uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      });
    }

    await uploadTask;
    const downloadUrl = await getDownloadURL(storageRef);

    return {
      downloadUrl,
      path: filePath,
      name: file.name,
      size: file.size,
      type: file.type,
    };
  } catch (error) {
    console.error('[LETCON] Upload error:', error);
    throw new Error('Failed to upload file. Please try again.');
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
 * Deletes a file from storage.
 * @param {string} path - The storage path.
 * @returns {Promise<void>}
 */
export async function deleteFile(path) {
  if (!path) return;
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('[LETCON] Delete error:', error);
    throw new Error('Failed to delete file');
  }
}

/**
 * Gets the download URL for a file.
 * @param {string} path - The storage path.
 * @returns {Promise<string>} The download URL.
 */
export async function getFileUrl(path) {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('[LETCON] URL fetch error:', error);
    throw new Error('Failed to get file URL');
  }
}

/**
 * Lists all files in a folder.
 * @param {string} folder - The storage folder.
 * @returns {Promise<Array<Object>>} Array of file references.
 */
export async function listFiles(folder) {
  try {
