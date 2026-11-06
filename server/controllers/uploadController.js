import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import cloudinary, { cloudinaryEnabled } from '../config/cloudinary.js';
import { ApiError, asyncHandler } from '../utils/asyncHandler.js';
import { safeExt } from '../middleware/uploadMiddleware.js';

// POST /api/upload/event-image  (organizer, multipart field "image")
export const uploadEventImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image uploaded');
  if (cloudinaryEnabled) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'cems/events' }, (err, out) => (err ? reject(err) : resolve(out)));
      stream.end(req.file.buffer);
    });
    return res.status(201).json({ url: result.secure_url });
  }
  // Fallback: save locally and serve from /uploads
  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${safeExt(req.file.originalname)}`;
  const dir = path.resolve('uploads');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), req.file.buffer);
  res.status(201).json({ url: `${req.protocol}://${req.get('host')}/uploads/${name}` });
});
