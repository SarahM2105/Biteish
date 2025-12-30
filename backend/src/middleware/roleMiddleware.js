function requiredRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).send('Not authenticated ( log in instead) ');
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).send('Not authorized');
        }
        next();
    };
}

module.exports = requiredRole;