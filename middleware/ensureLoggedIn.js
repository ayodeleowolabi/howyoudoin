module.exports = function ensureLoggedIn(req, res, next) {
  if (req.user) return next();
  res.redirect('/auth/login');
};
