/**
 * Background Location Tracking Service
 * Handles continuous GPS tracking for field sales reps
 */

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
  private watchId: number | null = null;
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
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      if (this.isTracking) {
        resolve();
        return;
      }

      this.updateCallback = onUpdate;
      const geoOptions = {
        enableHighAccuracy: options?.enableHighAccuracy ?? true,
        timeout: options?.timeout ?? 30000,
        maximumAge: options?.maximumAge ?? 0,
      };

      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
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
        },
        (error) => {
          console.error("Geolocation error:", error);
          reject(error);
        },
        geoOptions
      );

      this.isTracking = true;
      resolve();
    });
  }

  /**
   * Stop background location tracking
   */
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
  }

  /**
   * Get current location
   */
  getCurrentLocation(): Promise<LocationUpdate> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            speed: position.coords.speed ?? undefined,
            heading: position.coords.heading ?? undefined,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
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
}

export interface GeofenceEvent {
  type: "enter" | "exit";
  geofence: string;
  location: LocationUpdate;
}

// Export singleton instance
export const backgroundTracker = new BackgroundTracker();

/**
 * Request location permission
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    if (!navigator.permissions) {
      return true; // Assume granted if permissions API not available
    }

    const result = await navigator.permissions.query({
      name: "geolocation",
    });

    return result.state === "granted" || result.state === "prompt";
  } catch (error) {
    console.error("Permission query error:", error);
    return false;
  }
}

/**
 * Check if location permission is granted
 */
export async function isLocationPermissionGranted(): Promise<boolean> {
  try {
    if (!navigator.permissions) {
      return true;
    }

    const result = await navigator.permissions.query({
      name: "geolocation",
    });

    return result.state === "granted";
  } catch (error) {
    console.error("Permission check error:", error);
    return false;
  }
}
