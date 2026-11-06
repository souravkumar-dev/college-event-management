import { validationResult } from 'express-validator';
import { ApiError } from '../utils/asyncHandler.js';

export const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new ApiError(400, errors.array()[0].msg));
  next();
};

export const notFound = (req, _res, next) => next(new ApiError(404, `Route not found: ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500;
  let message = err.message || 'Server error';
  if (err.name === 'CastError') { status = 404; message = 'Resource not found'; }
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors)[0].message; }
  if (err.code === 11000) { status = 409; message = 'Duplicate record'; }
  if (err.name === 'MulterError') { status = 400; }
  if (status === 500) console.error(err);
  res.status(status).json({ message });
};
