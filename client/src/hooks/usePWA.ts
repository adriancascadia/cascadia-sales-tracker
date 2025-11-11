import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAState {
  isInstalled: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  isSyncing: boolean;
  pendingOperations: number;
  showInstallPrompt: () => void;
  requestNotificationPermission: () => Promise<boolean>;
  notificationPermission: NotificationPermission;
}

export function usePWA(): PWAState {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingOperations, setPendingOperations] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    'default'
  );

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js', { scope: '/' })
        .then((registration) => {
          console.log('Service Worker registered:', registration);

          // Listen for controller change (SW update)
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Service Worker updated');
          });

          // Listen for messages from SW
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'SYNC_OFFLINE_QUEUE') {
              console.log('Syncing offline queue...');
              setIsSyncing(true);
              setTimeout(() => setIsSyncing(false), 2000);
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Check if app is installed
  useEffect(() => {
    const checkInstalled = () => {
      // Check if running as PWA
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);
    };

    checkInstalled();
    window.addEventListener('beforeinstallprompt', checkInstalled);
    return () => window.removeEventListener('beforeinstallprompt', checkInstalled);
  }, []);

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      console.log('PWA installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Monitor pending operations from offline storage
  useEffect(() => {
    const checkPendingOperations = async () => {
      try {
        const db = await (window as any).offlineStorage?.getPendingOperations?.();
        if (db) {
          setPendingOperations(db.length);
        }
      } catch (error) {
        console.error('Error checking pending operations:', error);
      }
    };

    const interval = setInterval(checkPendingOperations, 5000);
    checkPendingOperations();

    return () => clearInterval(interval);
  }, []);

  const showInstallPrompt = useCallback(async () => {
    if (!deferredPrompt) {
      console.log('Install prompt not available');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);

      if (outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  }, [deferredPrompt]);

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  return {
    isInstalled,
    isInstallable,
    isOnline,
    isSyncing,
    pendingOperations,
    showInstallPrompt,
    requestNotificationPermission,
    notificationPermission,
  };
}
