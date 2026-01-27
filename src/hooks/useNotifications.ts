import { useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useDeadlines } from './useDeadlines';
import { toast } from 'sonner';

interface NotificationSettings {
  enabled: boolean;
  permission: NotificationPermission;
  notify24h: boolean;
  notify1h: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  permission: 'default',
  notify24h: true,
  notify1h: true,
};

// Track which notifications have been sent to avoid duplicates
interface SentNotifications {
  [deadlineId: string]: {
    sent24h?: boolean;
    sent1h?: boolean;
  };
}

export function useNotifications() {
  const [settings, setSettings] = useLocalStorage<NotificationSettings>(
    'deadliner-notification-settings',
    DEFAULT_SETTINGS
  );
  const [sentNotifications, setSentNotifications] = useLocalStorage<SentNotifications>(
    'deadliner-sent-notifications',
    {}
  );
  const { deadlines } = useDeadlines();
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Tu navegador no soporta notificaciones');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setSettings(prev => ({
        ...prev,
        permission,
        enabled: permission === 'granted',
      }));

      if (permission === 'granted') {
        toast.success('¡Notificaciones activadas!');
        // Show a test notification
        new Notification('Deadliner 🎯', {
          body: 'Recibirás alertas cuando tus deadlines estén próximos',
          icon: '/favicon.ico',
          tag: 'test',
        });
        return true;
      } else if (permission === 'denied') {
        toast.error('Notificaciones bloqueadas. Habilítalas en la configuración del navegador.');
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Error al solicitar permisos de notificación');
      return false;
    }
  }, [setSettings]);

  const toggleNotifications = useCallback(async () => {
    if (settings.enabled) {
      setSettings(prev => ({ ...prev, enabled: false }));
      toast.info('Notificaciones desactivadas');
    } else {
      await requestPermission();
    }
  }, [settings.enabled, setSettings, requestPermission]);

  const toggle24h = useCallback(() => {
    setSettings(prev => ({ ...prev, notify24h: !prev.notify24h }));
  }, [setSettings]);

  const toggle1h = useCallback(() => {
    setSettings(prev => ({ ...prev, notify1h: !prev.notify1h }));
  }, [setSettings]);

  const sendNotification = useCallback((title: string, body: string, tag: string) => {
    if (!settings.enabled || Notification.permission !== 'granted') return;

    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag,
        requireInteraction: true,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [settings.enabled]);

  const checkDeadlines = useCallback(() => {
    if (!settings.enabled) return;

    const now = Date.now();
    const updatedSent = { ...sentNotifications };

    deadlines.forEach(deadline => {
      // Skip completed deadlines
      if (deadline.completed_at) return;

      const deadlineTime = new Date(deadline.deadline_at).getTime();
      const hoursUntil = (deadlineTime - now) / (1000 * 60 * 60);
      const deadlineRecord = updatedSent[deadline.id] || {};

      // 24h notification (between 23-24 hours)
      if (settings.notify24h && hoursUntil <= 24 && hoursUntil > 23 && !deadlineRecord.sent24h) {
        sendNotification(
          '⚠️ Deadline en 24 horas',
          `"${deadline.title}" vence mañana`,
          `deadline-24h-${deadline.id}`
        );
        updatedSent[deadline.id] = { ...deadlineRecord, sent24h: true };
      }

      // 1h notification (between 50-60 minutes)
      if (settings.notify1h && hoursUntil <= 1 && hoursUntil > 0.83 && !deadlineRecord.sent1h) {
        sendNotification(
          '🚨 ¡Deadline en 1 hora!',
          `"${deadline.title}" vence pronto`,
          `deadline-1h-${deadline.id}`
        );
        updatedSent[deadline.id] = { ...deadlineRecord, sent1h: true };
      }
    });

    // Only update if something changed
    if (JSON.stringify(updatedSent) !== JSON.stringify(sentNotifications)) {
      setSentNotifications(updatedSent);
    }
  }, [settings, deadlines, sentNotifications, setSentNotifications, sendNotification]);

  // Clear old notification records (for completed/deleted deadlines)
  const cleanupNotifications = useCallback(() => {
    const activeDeadlineIds = new Set(deadlines.map(d => d.id));
    const cleaned: SentNotifications = {};
    
    Object.keys(sentNotifications).forEach(id => {
      if (activeDeadlineIds.has(id)) {
        cleaned[id] = sentNotifications[id];
      }
    });

    if (Object.keys(cleaned).length !== Object.keys(sentNotifications).length) {
      setSentNotifications(cleaned);
    }
  }, [deadlines, sentNotifications, setSentNotifications]);

  // Set up periodic checking
  useEffect(() => {
    if (settings.enabled) {
      // Check immediately
      checkDeadlines();
      
      // Then check every minute
      checkIntervalRef.current = setInterval(checkDeadlines, 60 * 1000);
      
      // Cleanup old records every 5 minutes
      const cleanupInterval = setInterval(cleanupNotifications, 5 * 60 * 1000);

      return () => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
        clearInterval(cleanupInterval);
      };
    }
  }, [settings.enabled, checkDeadlines, cleanupNotifications]);

  // Update permission status on mount
  useEffect(() => {
    if ('Notification' in window) {
      setSettings(prev => ({
        ...prev,
        permission: Notification.permission,
        enabled: prev.enabled && Notification.permission === 'granted',
      }));
    }
  }, [setSettings]);

  return {
    settings,
    isSupported: 'Notification' in window,
    requestPermission,
    toggleNotifications,
    toggle24h,
    toggle1h,
  };
}
