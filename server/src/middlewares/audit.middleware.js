import AuditLog from '../models/AuditLog.js';

/**
 * Creates an Express middleware that logs actions to the AuditLog collection
 * @param {string} action - The action identifier (e.g., 'auth.login')
 * @param {string} resource - The resource being accessed (e.g., 'User')
 */
export const auditAction = (action, resource) => {
  return async (req, res, next) => {
    // Intercept the response to log AFTER it finishes
    const originalSend = res.send;
    
    res.send = function (body) {
      // Restore original send so it's not called recursively
      res.send = originalSend;
      
      const statusCode = res.statusCode;
      const status = statusCode >= 400 ? 'failure' : 'success';
      
      // Fire and forget audit log creation
      AuditLog.create({
        user: req.user ? req.user._id : null,
        action,
        resource,
        resourceId: req.params.id || req.auditResourceId || null,
        details: req.auditDetails || {},
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        status,
      }).catch(err => console.error('Failed to write audit log:', err));

      return res.send(body);
    };

    next();
  };
};
