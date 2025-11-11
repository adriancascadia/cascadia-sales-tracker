import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Bell, Wifi, WifiOff, Download } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function PWAStatus() {
  const { isOnline, isSyncing, pendingOperations, isInstallable, showInstallPrompt, requestNotificationPermission, notificationPermission } = usePWA();
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  const handleNotificationRequest = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      toast.success('Notifications enabled');
      setShowNotificationPrompt(false);
    } else {
      toast.error('Notification permission denied');
    }
  };

  const handleInstall = async () => {
    await showInstallPrompt();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Online/Offline Status */}
      {!isOnline && (
        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs font-medium">
          <WifiOff className="h-3 w-3" />
          Offline
        </div>
      )}

      {isOnline && isSyncing && (
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium animate-pulse">
          <Wifi className="h-3 w-3" />
          Syncing...
        </div>
      )}

      {isOnline && pendingOperations > 0 && (
        <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-md text-xs font-medium">
          <Wifi className="h-3 w-3" />
          {pendingOperations} pending
        </div>
      )}

      {/* Notification Permission */}
      {notificationPermission === 'default' && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1 text-xs"
          onClick={handleNotificationRequest}
        >
          <Bell className="h-3 w-3" />
          Enable Notifications
        </Button>
      )}

      {/* Install Prompt */}
      {isInstallable && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1 text-xs"
          onClick={handleInstall}
        >
          <Download className="h-3 w-3" />
          Install App
        </Button>
      )}
    </div>
  );
}
