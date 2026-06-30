import { Alert } from '../Analytics.model.js';
import { ALERT_SEVERITY } from '../Analytics.constants.js';

export class AlertEngine {
  /**
   * Evaluates incoming metrics against predefined system thresholds.
   */
  static async evaluate(metric) {
    if (metric.name === 'memory_usage' && metric.value > 90) {
      await this.triggerAlert(
        'High Memory Usage',
        ALERT_SEVERITY.CRITICAL,
        `System memory usage exceeded 90% (Current: ${metric.value.toFixed(2)}%)`,
        'system'
      );
    }

    if (metric.name === 'db_connection_state' && metric.value !== 1) {
      await this.triggerAlert(
        'Database Disconnected',
        ALERT_SEVERITY.FATAL,
        `MongoDB connection state is ${metric.value}`,
        'database'
      );
    }
    
    if (metric.name === 'ai_hallucination_rate' && metric.value > 0.1) {
       await this.triggerAlert(
        'High Hallucination Rate',
        ALERT_SEVERITY.WARNING,
        `AI is hallucinating on ${metric.value * 100}% of recent queries.`,
        'ai_orchestrator'
      );
    }
  }

  static async triggerAlert(name, severity, message, source) {
    console.error(`[ALERT][${severity.toUpperCase()}] ${name}: ${message}`);
    
    // In a real system, this would also trigger PagerDuty / Slack integrations
    await Alert.create({ name, severity, message, source });
  }
}
