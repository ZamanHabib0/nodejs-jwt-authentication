const jwt = require("jsonwebtoken");
const { pwEncryptionKey } = require("../config/var.js");
const models = require("../api/admin/models/index.models.js");
const globalServices = require("../services/globalService.js");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return globalServices.returnResponse(
        res,
        401,
        true,
        "Authentication token required",
        {}
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, pwEncryptionKey);

    const user = await models.authAdmin.findById(decoded.sub).select("-password");
    if (!user) {
      return globalServices.returnResponse(
        res,
        401,
        true,
        "User associated with token not found",
        {}
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return globalServices.returnResponse(
      res,
      401,
      true,
      "Invalid or expired token",
      { error: error.message }
    );
  }
};

const authorize = (roles = []) => {
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user || (roles.length && !roles.includes(req.user.role))) {
      return globalServices.returnResponse(
        res,
        403,
        true,
        "Forbidden: You do not have permission to access this resource",
        {}
      );
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
