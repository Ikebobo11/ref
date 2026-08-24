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
