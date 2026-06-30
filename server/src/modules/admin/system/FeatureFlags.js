import { FeatureFlag } from '../Admin.model.js';
import { AuditAdministration } from '../security/AuditAdministration.js';
import { AUDIT_ACTIONS } from '../Admin.constants.js';

export class FeatureFlags {
  static async getAllFlags() {
    return await FeatureFlag.find().lean();
  }

  static async isEnabled(name, user = null) {
    const flag = await FeatureFlag.findOne({ name }).lean();
    if (!flag || !flag.isEnabled) return false;

    // Rollout percentage logic
    if (flag.rolloutPercentage < 100) {
      if (!user) return false;
      // Simple hash-based bucketing based on user ID
      const bucket = parseInt(user._id.toString().slice(-2), 16) % 100;
      if (bucket >= flag.rolloutPercentage) return false;
    }

    // Role-based logic
    if (flag.allowedRoles && flag.allowedRoles.length > 0) {
      if (!user || !flag.allowedRoles.includes(user.role)) return false;
    }

    return true;
  }

  static async toggleFlag(name, isEnabled, adminUser) {
    const flag = await FeatureFlag.findOneAndUpdate(
      { name },
      { isEnabled, updatedBy: adminUser._id, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    await AuditAdministration.logAction(
      adminUser._id,
      AUDIT_ACTIONS.FEATURE_TOGGLE,
      `FeatureFlag:${name}`,
      { isEnabled }
    );

    return flag;
  }
}
