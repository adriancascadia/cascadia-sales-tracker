/**
 * Background Location Tracking Service
 * Handles continuous GPS tracking for field sales reps
 */
import { Geolocation } from '@capacitor/geolocation';

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  speed?: number;
  heading?: number;
}

export interface TrackingOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  updateInterval?: number;
}

export interface GeofenceOptions {
  latitude: number;
  longitude: number;
  radius: number; // in meters
  name: string;
}

class BackgroundTracker {
  private watchId: string | null = null; // Capacitor watch returns a string ID
  private locations: LocationUpdate[] = [];
  private geofences: GeofenceOptions[] = [];
  private isTracking = false;
  private updateCallback: ((location: LocationUpdate) => void) | null = null;
  private geofenceCallback: ((event: GeofenceEvent) => void) | null = null;

  /**
   * Start background location tracking
   */
  startTracking(
    onUpdate: (location: LocationUpdate) => void,
    options?: TrackingOptions
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (this.isTracking) {
        resolve();
        return;
      }

      this.updateCallback = onUpdate;

      try {
        const hasPermission = await this.checkAndRequestPermission();
        if (!hasPermission) {
          reject(new Error("Location permission not granted"));
          return;
        }

        this.watchId = await Geolocation.watchPosition({
          enableHighAccuracy: options?.enableHighAccuracy ?? true,
          timeout: options?.timeout ?? 30000,
          maximumAge: options?.maximumAge ?? 0,
        }, (position, err) => {
          if (err) {
            console.error("Geolocation error:", err);
            // Don't reject the promise here as it's already resolved, but maybe notify listener?
            return;
          }

          if (position) {
            const location: LocationUpdate = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
              speed: position.coords.speed ?? undefined,
              heading: position.coords.heading ?? undefined,
            };

            this.locations.push(location);
            this.checkGeofences(location);
            onUpdate(location);

            // Keep only last 100 locations in memory
            if (this.locations.length > 100) {
              this.locations.shift();
            }
          }
        });

        this.isTracking = true;
        resolve();
      } catch (error) {
        console.error("Error starting tracking:", error);
        reject(error);
      }
    });
  }

  /**
   * Stop background location tracking
   */
  async stopTracking(): Promise<void> {
    if (this.watchId !== null) {
      await Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
    this.isTracking = false;
  }

  /**
   * Get current location
   */
  async getCurrentLocation(): Promise<LocationUpdate> {
    try {
      const hasPermission = await this.checkAndRequestPermission();
      if (!hasPermission) {
        throw new Error("Location permission denied");
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
        speed: position.coords.speed ?? undefined,
        heading: position.coords.heading ?? undefined,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add geofence for automatic check-in
   */
  addGeofence(geofence: GeofenceOptions): void {
    this.geofences.push(geofence);
  }

  /**
   * Remove geofence
   */
  removeGeofence(name: string): void {
    this.geofences = this.geofences.filter((g) => g.name !== name);
  }

  /**
   * Check if location is within any geofence
   */
  private checkGeofences(location: LocationUpdate): void {
    if (!this.geofenceCallback) return;

    this.geofences.forEach((geofence) => {
      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        geofence.latitude,
        geofence.longitude
      );

      if (distance <= geofence.radius) {
        this.geofenceCallback?.({
          type: "enter",
          geofence: geofence.name,
          location,
        });
      }
    });
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Get tracking history
   */
  getTrackingHistory(): LocationUpdate[] {
    return [...this.locations];
  }

  /**
   * Clear tracking history
   */
  clearHistory(): void {
    this.locations = [];
  }

  /**
   * Check if currently tracking
   */
  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  /**
   * Set geofence callback
   */
  setGeofenceCallback(callback: (event: GeofenceEvent) => void): void {
    this.geofenceCallback = callback;
  }

  private async checkAndRequestPermission(): Promise<boolean> {
    try {
      const status = await Geolocation.checkPermissions();
      if (status.location === 'granted') {
        return true;
      }
      const request = await Geolocation.requestPermissions();
      return request.location === 'granted';
    } catch (e) {
      console.error("Error checking/requesting permissions", e);
      return false;
    }
  }
}

export interface GeofenceEvent {
  type: "enter" | "exit";
  geofence: string;
  location: LocationUpdate;
}

// Export singleton instance
export const backgroundTracker = new BackgroundTracker();

// Re-export deprecated functions for backward compatibility (but implemented with Capacitor)
export async function requestLocationPermission(): Promise<boolean> {
  // Try to use the tracker instance logic or direct Capacitor call
  try {
    const status = await Geolocation.requestPermissions();
    return status.location === 'granted';
  } catch (e) {
    console.error("Error requesting permissions", e);
    return false;
  }
}

export async function isLocationPermissionGranted(): Promise<boolean> {
  try {
    const status = await Geolocation.checkPermissions();
    return status.location === 'granted';
  } catch (e) {
    console.error("Error checking permissions", e);
    return false;
  }
}
