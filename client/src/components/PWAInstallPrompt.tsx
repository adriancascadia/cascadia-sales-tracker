import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export default function PWAInstallPrompt() {
  const { isInstallable, showInstallPrompt, isInstalled } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the prompt
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  useEffect(() => {
    // Show prompt if installable and not dismissed
    if (isInstallable && !dismissed && !isInstalled) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isInstallable, dismissed, isInstalled]);

  const handleInstall = async () => {
    await showInstallPrompt();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    setDismissed(true);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-border rounded-lg shadow-lg p-4 max-w-sm z-50 animate-in slide-in-from-bottom-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">Install SalesForce Tracker</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Install the app on your home screen for quick access and offline support
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleInstall}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Install
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDismiss}
            >
              Not now
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
