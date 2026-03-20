import db from '../config/db.js';

// Middleware to log incoming HTTP requests to the database
export default async function requestLogger(req, res, next) {
  try {
    // Skip logging for static assets (CSS, images)
    if (req.url.includes('.css') || req.url.includes('.jpg') || req.url.includes('.png')) {
      return next();
    }

    await db.logRequest(req.originalUrl, req.method);

    return next();
  } catch (err) {
    console.error('Request logging error:', err);
    // Don't block the request even if logging fails
    return next();
  }
}
