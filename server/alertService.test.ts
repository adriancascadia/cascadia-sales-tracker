import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRouteDeviation, checkRouteDelay } from './alertService';
import * as db from './db';
import * as notificationService from './notificationService';
import { logger } from './_core/logger';

// Mock dependencies
vi.mock('./db');
vi.mock('./notificationService');
vi.mock('./_core/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('alertService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkRouteDeviation', () => {
    it('should create an alert if distance is greater than threshold', async () => {
      // Mock db.createAlert
      const createAlertMock = vi.fn().mockResolvedValue({ insertId: 1 });
      vi.mocked(db.createAlert).mockImplementation(createAlertMock);

      // Mock notificationService.sendAlertNotification
      vi.mocked(notificationService.sendAlertNotification).mockResolvedValue(true);

      await checkRouteDeviation(1, 1, 1000); // 1000 meters deviation

      expect(createAlertMock).toHaveBeenCalledWith(expect.objectContaining({
        alertType: 'route_deviation',
        companyId: 1, // Hardcoded in service for now
        userId: 1,
      }));
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should not create an alert if distance is within threshold', async () => {
      await checkRouteDeviation(1, 1, 100); // 100 meters deviation (below 500m threshold)

      expect(db.createAlert).not.toHaveBeenCalled();
    });
  });

  describe('checkRouteDelay', () => {
    it('should create an alert if delay is greater than threshold', async () => {
       // Mock db.createAlert
       const createAlertMock = vi.fn().mockResolvedValue({ insertId: 1 });
       vi.mocked(db.createAlert).mockImplementation(createAlertMock);
 
       // Mock notificationService.sendAlertNotification
       vi.mocked(notificationService.sendAlertNotification).mockResolvedValue(true);

      await checkRouteDelay(1, 1, 45); // 45 minutes delay

      expect(createAlertMock).toHaveBeenCalledWith(expect.objectContaining({
        alertType: 'significant_delay',
        companyId: 1,
        userId: 1,
      }));
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should not create an alert if delay is within threshold', async () => {
      await checkRouteDelay(1, 1, 15); // 15 minutes delay (below 30m threshold)

      expect(db.createAlert).not.toHaveBeenCalled();
    });
  });
});
