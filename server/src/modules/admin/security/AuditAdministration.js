import { AuditLog } from '../Admin.model.js';

export class AuditAdministration {
  /**
   * Universal logging sink for all administrative actions across the platform.
   */
  static async logAction(adminId, action, resource, details, ipAddress = 'unknown') {
    return await AuditLog.create({
      adminId,
      action,
      resource,
      details,
      ipAddress
    });
  }

  /**
   * Retrieves paginated audit logs for the security dashboard.
   */
  static async getLogs(page = 1, limit = 50, filters = {}) {
    const skip = (page - 1) * limit;
    return await AuditLog.find(filters)
      .populate('adminId', 'name email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }
}
