import { Metric } from '../Analytics.model.js';
import { AlertEngine } from '../alerts/AlertEngine.js';

export class AnalyticsCollector {
  /**
   * Universal entry point to record any telemetry event.
   */
  static async record(type, name, value, tags = {}) {
    const metric = await Metric.create({
      type,
      name,
      value,
      tags
    });

    // Fire off to the alert engine asynchronously to check thresholds
    // We don't await this so we don't block the caller
    AlertEngine.evaluate(metric).catch(err => console.error('Alert Engine Failure:', err));

    return metric;
  }
}
