// authorizeRoles.js
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const user = req.user; // set by authMiddleware

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (allowedRoles.includes(user.role)) {
      return next();
    }

    if (req.params.id && String(req.params.id) === String(user.id)) {
      return next();
    }

    return res.status(403).json({ message: 'Forbidden' });
  };
}

module.exports = {authorizeRoles}
