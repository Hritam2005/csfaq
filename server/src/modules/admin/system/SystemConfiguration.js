import { SystemConfig } from '../Admin.model.js';
import { AuditAdministration } from '../security/AuditAdministration.js';
import { AUDIT_ACTIONS } from '../Admin.constants.js';
import { AdminError, ERROR_CODES } from '../Admin.errors.js';

export class SystemConfiguration {
  /**
   * Fetches all configuration key/value pairs. Masks sensitive values.
   */
  static async getAllConfigs() {
    const configs = await SystemConfig.find().lean();
    return configs.map(c => {
      if (c.isSensitive) c.value = '********';
      return c;
    });
  }

  static async getConfig(key) {
    const config = await SystemConfig.findOne({ key }).lean();
    return config ? config.value : null;
  }

  /**
   * Updates a system configuration and writes an audit log.
   */
  static async updateConfig(key, value, adminUser) {
    const config = await SystemConfig.findOne({ key });
    if (!config) {
      throw new AdminError(`Configuration ${key} not found`, ERROR_CODES.INVALID_CONFIGURATION);
    }

    const oldValue = config.isSensitive ? '********' : config.value;
    const newValue = config.isSensitive ? '********' : value;

    config.value = value;
    config.updatedBy = adminUser._id;
    config.updatedAt = new Date();
    await config.save();

    await AuditAdministration.logAction(
      adminUser._id,
      AUDIT_ACTIONS.CONFIG_UPDATE,
      `SystemConfig:${key}`,
      { oldValue, newValue }
    );

    return config;
  }
}
