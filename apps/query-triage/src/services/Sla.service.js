import { env } from '../config/env.js';
import { PriorityLevel } from '../models/QueryCase.model.js';

/**
 * SLA Service - Service Level Agreement calculation
 * 
 * Implements the priority-based SLA targets from product.md:
 * - P0: 15 min response, 2h resolution (24/7)
 * - P1: 1h response, 4h resolution
 * - P2: 8h response, 48h resolution
 * - P3: 48h response, 120h resolution
 */
export class SlaService {
  /**
   * Calculate SLA due date based on priority
   */
  static calculateSlaDue(priority, type = 'response') {
    const now = new Date();
    
    switch (priority) {
      case PriorityLevel.P0:
        if (type === 'response') {
          return new Date(now.getTime() + env.sla.p0.responseMinutes * 60 * 1000);
        }
        return new Date(now.getTime() + env.sla.p0.resolutionHours * 60 * 60 * 1000);
        
      case PriorityLevel.P1:
        if (type === 'response') {
          return this.addBusinessHours(now, env.sla.p1.responseHours);
        }
        return this.addBusinessHours(now, env.sla.p1.resolutionHours);
        
      case PriorityLevel.P2:
        if (type === 'response') {
          return this.addBusinessHours(now, env.sla.p2.responseHours);
        }
        return this.addBusinessHours(now, env.sla.p2.resolutionHours);
        
      case PriorityLevel.P3:
      default:
        if (type === 'response') {
          return this.addBusinessHours(now, env.sla.p3.responseHours);
        }
        return this.addBusinessHours(now, env.sla.p3.resolutionHours);
    }
  }

  /**
   * Add business hours to a date
   * Assumes 9 AM - 6 PM, Monday-Friday
   */
  static addBusinessHours(startDate, hours) {
    const date = new Date(startDate);
    let hoursRemaining = hours;
    
    while (hoursRemaining > 0) {
      date.setHours(date.getHours() + 1);
      
      const dayOfWeek = date.getDay();
      const hour = date.getHours();
      
      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue;
      }
      
      // Skip outside business hours (9 AM - 6 PM)
      if (hour < 9 || hour >= 18) {
        continue;
      }
      
      hoursRemaining--;
    }
    
    return date;
  }

  /**
   * Calculate remaining SLA time
   */
  static getRemainingTime(slaDueAt) {
    if (!slaDueAt) return null;
    
    const now = Date.now();
    const due = new Date(slaDueAt).getTime();
    const remaining = due - now;
    
    if (remaining < 0) {
      return {
        overdue: true,
        overdueMs: Math.abs(remaining),
        overdueText: this.formatDuration(Math.abs(remaining)),
      };
    }
    
    return {
      overdue: false,
      remainingMs: remaining,
      remainingText: this.formatDuration(remaining),
    };
  }

  /**
   * Format duration in milliseconds to human readable string
   */
  static formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m`;
    }
    return `${seconds}s`;
  }

  /**
   * Get SLA status for a case
   */
  static getSlaStatus(slaDueAt) {
    const remaining = this.getRemainingTime(slaDueAt);
    
    if (!remaining) {
      return { status: 'unknown', text: 'No SLA set' };
    }
    
    if (remaining.overdue) {
      return { status: 'breached', text: `Overdue by ${remaining.overdueText}` };
    }
    
    const remainingHours = remaining.remainingMs / (1000 * 60 * 60);
    
    if (remainingHours < 1) {
      return { status: 'critical', text: `Due in ${remaining.remainingText}` };
    }
    if (remainingHours < 4) {
      return { status: 'warning', text: `Due in ${remaining.remainingText}` };
    }
    
    return { status: 'ok', text: `${remaining.remainingText} remaining` };
  }

  /**
   * Recalculate SLA for escalation
   */
  static recalculateForEscalation(priority, originalSlaDue) {
    const newSlaDue = this.calculateSlaDue(priority);
    
    // Only update if new SLA is sooner (escalation)
    if (new Date(newSlaDue) < new Date(originalSlaDue)) {
      return newSlaDue;
    }
    
    // Keep original if not escalated
    return originalSlaDue;
  }
}

export default SlaService;
