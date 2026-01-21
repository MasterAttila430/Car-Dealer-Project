export function authorize() {
  return (req, res, next) => {
    // Megnézzük, hogy be van-e lépve
    if (!req.session.userId) {
      return res.status(401).render('error', { message: 'Ehhez a funkcióhoz be kell jelentkezned!' });
    }

    return next();
  };
}
