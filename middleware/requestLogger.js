import db from '../config/db.js';

export default async function requestLogger(req, res, next) {
  try {
    // Statikus fájlokat (képek, css) ne logoljuk
    if (req.url.includes('.css') || req.url.includes('.jpg') || req.url.includes('.png')) {
      return next();
    }

    // Várakozunk a logolásra
    await db.logRequest(req.originalUrl, req.method);

    return next();
  } catch (err) {
    console.error('Middleware logolási hiba:', err);

    return next();
  }
}
