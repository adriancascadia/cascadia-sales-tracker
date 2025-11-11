import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  isBiometricAvailable,
  isBiometricRegistered,
  registerBiometric,
  removeBiometric,
} from "@/lib/biometricAuth";
import {
  isLocationPermissionGranted,
  requestLocationPermission,
  backgroundTracker,
} from "@/lib/backgroundTracking";
import { useAuth } from "@/_core/hooks/useAuth";
import { Smartphone, Fingerprint, MapPin, Bell, Download, Zap } from "lucide-react";
import { toast } from "sonner";

export default function MobileSettings() {
  const { user } = useAuth();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricRegistered, setBiometricRegistered] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [backgroundTracking, setBackgroundTracking] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkBiometric();
    checkLocationPermission();
  }, []);

  const checkBiometric = async () => {
    const available = await isBiometricAvailable();
    setBiometricAvailable(available);
    if (available) {
      setBiometricRegistered(isBiometricRegistered());
    }
  };

  const checkLocationPermission = async () => {
    const granted = await isLocationPermissionGranted();
    setLocationPermission(granted);
  };

  const handleBiometricToggle = async () => {
    if (!biometricAvailable) {
      toast.error("Biometric authentication not available on this device");
      return;
    }

    setIsLoading(true);
    try {
      if (biometricRegistered) {
        removeBiometric();
        setBiometricRegistered(false);
        toast.success("Biometric authentication disabled");
      } else {
        const result = await registerBiometric(user?.id || "");
        if (result.success) {
          setBiometricRegistered(true);
          toast.success("Biometric authentication enabled");
        } else {
          toast.error(result.error || "Failed to enable biometric authentication");
        }
      }
    } catch (error) {
      toast.error("Error updating biometric settings");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationPermission = async () => {
    setIsLoading(true);
    try {
      const granted = await requestLocationPermission();
      if (granted) {
        setLocationPermission(true);
        toast.success("Location permission granted");
      } else {
        toast.error("Location permission denied");
      }
    } catch (error) {
      toast.error("Error requesting location permission");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackgroundTracking = async () => {
    if (!locationPermission) {
      toast.error("Please enable location permission first");
      return;
    }

    setIsLoading(true);
    try {
      if (backgroundTracking) {
        backgroundTracker.stopTracking();
        setBackgroundTracking(false);
        toast.success("Background tracking disabled");
      } else {
        await backgroundTracker.startTracking((location) => {
          console.log("Location update:", location);
        });
        setBackgroundTracking(true);
        toast.success("Background tracking enabled");
      }
    } catch (error) {
      toast.error("Error updating background tracking");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushNotifications = async () => {
    setIsLoading(true);
    try {
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          setPushNotifications(true);
          toast.success("Push notifications enabled");
        } else if (Notification.permission !== "denied") {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            setPushNotifications(true);
            toast.success("Push notifications enabled");
          } else {
            toast.error("Push notifications permission denied");
          }
        }
      } else {
        toast.error("Push notifications not supported");
      }
    } catch (error) {
      toast.error("Error updating push notifications");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Smartphone className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Mobile Settings</h1>
          <p className="text-muted-foreground">Configure mobile app features and permissions</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Biometric Authentication */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Fingerprint className="h-5 w-5 text-blue-600" />
                <div>
                  <CardTitle>Biometric Authentication</CardTitle>
                  <CardDescription>Use fingerprint or face recognition to unlock</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {biometricAvailable ? (
                  <Badge variant="outline" className="bg-green-50">
                    Available
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50">
                    Not Available
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {biometricRegistered
                  ? "Biometric authentication is enabled"
                  : "Enable biometric authentication for faster login"}
              </p>
              <Switch
                checked={biometricRegistered}
                onCheckedChange={handleBiometricToggle}
                disabled={!biometricAvailable || isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location Permission */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-green-600" />
                <div>
                  <CardTitle>Location Permission</CardTitle>
                  <CardDescription>Allow app to access your location</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {locationPermission ? (
                  <Badge variant="outline" className="bg-green-50">
                    Granted
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50">
                    Not Granted
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {locationPermission
                  ? "Location permission is granted"
                  : "Grant location permission to enable GPS tracking"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLocationPermission}
                disabled={locationPermission || isLoading}
              >
                {locationPermission ? "Granted" : "Request"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Background Location Tracking */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-purple-600" />
                <div>
                  <CardTitle>Background Tracking</CardTitle>
                  <CardDescription>Continuous GPS tracking during field work</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {backgroundTracking ? (
                  <Badge className="bg-purple-100 text-purple-800">Active</Badge>
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {backgroundTracking
                    ? "Background tracking is active"
                    : "Enable background tracking for automatic route logging"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Note: Requires location permission
                </p>
              </div>
              <Switch
                checked={backgroundTracking}
                onCheckedChange={handleBackgroundTracking}
                disabled={!locationPermission || isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-orange-600" />
                <div>
                  <CardTitle>Push Notifications</CardTitle>
                  <CardDescription>Receive alerts and reminders on your device</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {pushNotifications ? (
                  <Badge variant="outline" className="bg-green-50">
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50">
                    Disabled
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {pushNotifications
                  ? "Push notifications are enabled"
                  : "Enable push notifications for important alerts"}
              </p>
              <Switch
                checked={pushNotifications}
                onCheckedChange={handlePushNotifications}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* App Installation */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle>Install App</CardTitle>
                <CardDescription>Install SalesForce Tracker as a native app</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Install the app on your home screen for quick access and offline support.
            </p>
            <Button
              className="w-full"
              onClick={() => {
                if ("serviceWorker" in navigator) {
                  // Trigger install prompt if available
                  window.dispatchEvent(new Event("beforeinstallprompt"));
                  toast.success("Install prompt triggered");
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Install App
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base">Mobile App Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-blue-600">✓</span>
              <span>Offline-first functionality - work without internet</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">✓</span>
              <span>Automatic sync when connection returns</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">✓</span>
              <span>Fast biometric login with fingerprint or face</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">✓</span>
              <span>Background GPS tracking for route optimization</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">✓</span>
              <span>Push notifications for important alerts</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
