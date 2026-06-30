import mongoose from 'mongoose';
import { METRIC_TYPES, ALERT_SEVERITY } from './Analytics.constants.js';

const metricSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(METRIC_TYPES),
    required: true,
  },
  name: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  tags: { type: Map, of: String },
  timestamp: { type: Date, default: Date.now, index: true }
});

const alertSchema = new mongoose.Schema({
  name: { type: String, required: true },
  severity: {
    type: String,
    enum: Object.values(ALERT_SEVERITY),
    required: true,
  },
  message: { type: String, required: true },
  source: { type: String, required: true }, // e.g., 'cpu_monitor', 'ai_orchestrator'
  resolved: { type: Boolean, default: false },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now, index: true }
});

export const Metric = mongoose.model('Metric', metricSchema);
export const Alert = mongoose.model('Alert', alertSchema);
