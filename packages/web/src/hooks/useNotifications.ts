import { useCallback, useEffect, useState } from 'react';

export type NotificationPermission = 'granted' | 'denied' | 'default';

interface UseNotificationsReturn {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
}

export function useNotifications(): UseNotificationsReturn {
  const isSupported = typeof window !== 'undefined' && 'Notification' in window;

  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (!isSupported) return 'denied';
    return Notification.permission as NotificationPermission;
  });

  // Sync permission state if it changes externally
  useEffect(() => {
    if (!isSupported) return;
    setPermission(Notification.permission as NotificationPermission);
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) return 'denied';

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);
      return result as NotificationPermission;
    } catch {
      return 'denied';
    }
  }, [isSupported]);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!isSupported || permission !== 'granted') return;

      const defaultOptions: NotificationOptions = {
        icon: '/pwa-192x192.svg',
        badge: '/favicon.svg',
        tag: 'pinepomo-timer',
        ...options,
      };

      try {
        const notification = new Notification(title, defaultOptions);

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);

        // Focus window when clicked
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch {
        // Fallback for service worker context or errors
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title,
            options: defaultOptions,
          });
        }
      }
    },
    [isSupported, permission]
  );

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
  };
}

// Notification messages for different timer events
export const NOTIFICATION_MESSAGES = {
  workComplete: {
    title: 'Focus session complete!',
    body: 'Great work! Time for a break.',
  },
  breakComplete: {
    title: 'Break is over!',
    body: 'Ready to focus again?',
  },
  longBreakComplete: {
    title: 'Long break is over!',
    body: 'Feeling refreshed? Let\'s get back to work!',
  },
} as const;
