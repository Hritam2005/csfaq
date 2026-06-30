import { verifyAccessToken } from '../utils/jwt.util.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/User.js';
import Role from '../models/Role.js';

/**
 * Middleware to authenticate user via JWT Access Token
 */
export const authenticate = async (req, res, next) => {
  try {
    let token;
    
    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Fallback to cookie
    else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw ApiError.unauthorized('You are not logged in. Please provide a token.');
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Check if user still exists
    const currentUser = await User.findById(decoded.userId).populate({
      path: 'role',
      populate: { path: 'permissions' }
    });

    if (!currentUser) {
      throw ApiError.unauthorized('The user belonging to this token no longer exists.');
    }

    // Check account status
    if (currentUser.accountStatus !== 'active') {
      throw ApiError.forbidden(`Account is ${currentUser.accountStatus}. Contact support.`);
    }

    // Grant access to protected route
    req.user = currentUser;
    req.userPermissions = currentUser.role.permissions.map(p => p.name);
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict access to specific roles
 * @param {...string} roles - Allowed role names
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(ApiError.unauthorized());
    }

    if (!roles.includes(req.user.role.name) && req.user.role.name !== 'Super Admin') {
      return next(ApiError.forbidden('You do not have the required role to perform this action.'));
    }

    next();
  };
};

/**
 * Middleware to restrict access to specific permissions
 * @param {string} permissionName - Required permission name
 */
export const requirePermission = (permissionName) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    // Super Admins bypass permission checks
    if (req.user.role.name === 'Super Admin') {
      return next();
    }

    if (!req.userPermissions.includes(permissionName)) {
      return next(ApiError.forbidden(`You do not have the required permission: ${permissionName}`));
    }

    next();
  };
};
