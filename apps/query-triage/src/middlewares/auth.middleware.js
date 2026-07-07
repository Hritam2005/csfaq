import { verifyAccessToken } from '../utils/jwt.util.js';
import ApiError from '../utils/ApiError.js';

/**
 * Middleware to authenticate user via JWT Access Token
 */
export const authenticate = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw ApiError.unauthorized('You are not logged in. Please provide a token.');
    }

    const decoded = verifyAccessToken(token);
    
    // For query-triage, we accept minimal user info from token
    // In integrated mode, you can enrich from User model
    req.user = {
      _id: decoded.userId || decoded.id || decoded._id,
      roleId: decoded.roleId,
      roleName: decoded.roleName || decoded.role,
      fullName: decoded.fullName || decoded.name,
      email: decoded.email,
    };
    
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
    const userRole = (req.user?.roleName || req.user?.role?.name || req.user?.role || 'Registered User').toString().trim().toLowerCase();
    
    // Admin roles bypass
    const adminRoles = ['super admin', 'system administrator', 'admin', 'resolver', 'super_admin', 'system_admin'];
    if (adminRoles.includes(userRole)) {
      return next();
    }
    
    const allowedRoles = roles.map(r => r.toString().trim().toLowerCase());
    if (!allowedRoles.includes(userRole)) {
      return next(ApiError.forbidden('You do not have the required role to perform this action.'));
    }

    next();
  };
};

/**
 * Optional: Attach full user from csfaq User model
 * Use when running as integrated microservice
 */
export const enrichUserFromCsfaq = async (req, res, next) => {
  try {
    // Dynamic import to avoid hard dependency on csfaq
    const { default: User } = await import('../../../csfaq/server/src/models/User.js').catch(() => ({ default: null }));
    
    if (User && req.user?._id) {
      const fullUser = await User.findById(req.user._id).populate('role');
      if (fullUser) {
        req.user = fullUser;
        req.user.roleName = fullUser.role?.name || 'Registered User';
      }
    }
    next();
  } catch (error) {
    // Continue without full user enrichment
    next();
  }
};

export default { authenticate, requireRole, enrichUserFromCsfaq };
