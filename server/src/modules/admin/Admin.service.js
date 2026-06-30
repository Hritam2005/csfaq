import { SystemConfiguration } from './system/SystemConfiguration.js';
import { FeatureFlags } from './system/FeatureFlags.js';
import { BackupAdministration } from './system/BackupAdministration.js';
import { AuditAdministration } from './security/AuditAdministration.js';

export class AdminService {
  static async getConfigs() {
    return await SystemConfiguration.getAllConfigs();
  }

  static async updateConfig(key, value, adminUser) {
    return await SystemConfiguration.updateConfig(key, value, adminUser);
  }

  static async getFeatureFlags() {
    return await FeatureFlags.getAllFlags();
  }

  static async toggleFeatureFlag(name, isEnabled, adminUser) {
    return await FeatureFlags.toggleFlag(name, isEnabled, adminUser);
  }

  static async getBackups() {
    return await BackupAdministration.getBackups();
  }

  static async createBackup(type, adminUser) {
    return await BackupAdministration.createBackup(type, adminUser);
  }

  static async getAuditLogs(page, limit) {
    return await AuditAdministration.getLogs(page, limit);
  }
}
