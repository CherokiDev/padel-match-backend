// authorizationMiddleware.js
export const roleValidationMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.sendStatus(401);
    }

    const userRole = req.user.role;

    if (!roles.includes(userRole)) {
      return res.sendStatus(403);
    }

    next();
  };
};
