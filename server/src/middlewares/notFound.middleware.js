import ApiResponse from '../utils/ApiResponse.js';

export const notFound = (req, res, next) => {
  res.status(404).json(ApiResponse.error(`Route Not Found - ${req.originalUrl}`, 404));
};
