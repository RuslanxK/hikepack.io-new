const authMiddleware = require("./auth");

const conditionalAuthMiddleware = (req, res, next) => {
  if (req.query.auth === "false") {
    return next();
  }
  return authMiddleware(req, res, next);
};

module.exports = conditionalAuthMiddleware;
