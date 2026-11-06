import multer from 'multer';
import path from 'path';
import { ApiError } from '../utils/asyncHandler.js';

const fileFilter = (_req, file, cb) => {
  if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true);
  else cb(new ApiError(400, 'Only JPG, PNG or WEBP images are allowed'));
};

// Memory storage: the controller uploads to Cloudinary or writes to /uploads
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

export const safeExt = (name) => {
  const ext = path.extname(name).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
};
