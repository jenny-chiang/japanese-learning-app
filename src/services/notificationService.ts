import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 設定通知處理器
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * 請求通知權限
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('通知權限被拒絕');
      return false;
    }

    // Android 需要設定通知頻道
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-reminder', {
        name: '每日提醒',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366F1',
      });
    }

    return true;
  } catch (error) {
    console.error('請求通知權限失敗:', error);
    return false;
  }
}

/**
 * 排程每日通知
 * @param hour 小時 (0-23)
 * @param minute 分鐘 (0-59)
 */
export async function scheduleDailyNotification(hour: number, minute: number): Promise<string | null> {
  try {
    // 先取消所有現有通知
    await Notifications.cancelAllScheduledNotificationsAsync();

    // 設定每日通知
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📚 該學日文囉!',
        body: '今天還沒背單字和寫日記喔,慢慢來沒關係 🐌',
        data: { type: 'daily-reminder' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        repeats: true,
      } as Notifications.DailyTriggerInput,
    });

    console.log('已排程每日通知:', id, `時間: ${hour}:${minute}`);
    return id;
  } catch (error) {
    console.error('排程通知失敗:', error);
    return null;
  }
}

/**
 * 取消所有通知
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('已取消所有通知');
  } catch (error) {
    console.error('取消通知失敗:', error);
  }
}

/**
 * 檢查通知權限狀態
 */
export async function checkNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('檢查通知權限失敗:', error);
    return false;
  }
}

/**
 * 取得已排程的通知
 */
export async function getScheduledNotifications() {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    console.error('取得通知失敗:', error);
    return [];
  }
}
