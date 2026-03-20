// Middleware to protect routes that require authentication
export function authorize() {
  return (req, res, next) => {
    // Check if the user is logged in via session
    if (!req.session.userId) {
      return res.status(401).render('error', { message: 'You must be logged in to access this feature!' });
    }

    return next();
  };
}
