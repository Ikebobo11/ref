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
