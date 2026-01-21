import {
  requestNotificationPermissions,
  scheduleDailyNotification,
} from '../../src/services/notificationService';

describe('NotificationService', () => {
  describe('requestNotificationPermissions', () => {
    test('應該返回 boolean 值', async () => {
      const result = await requestNotificationPermissions();

      expect(typeof result).toBe('boolean');
    });
  });

  describe('scheduleDailyNotification', () => {
    test('應該返回 string 或 null', async () => {
      const result = await scheduleDailyNotification(21, 30);

      expect(result === null || typeof result === 'string').toBe(true);
    });
  });
});


