import { Geolocation, Position } from '@capacitor/geolocation';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  speed?: number | null;
  heading?: number | null;
}

export const LocationService = {
  async getCurrentPosition(): Promise<LocationCoordinates> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
        speed: position.coords.speed,
        heading: position.coords.heading,
      };
    } catch (error) {
      console.error('Error getting location', error);
      throw error;
    }
  },

  async watchPosition(callback: (position: LocationCoordinates | null, err?: any) => void): Promise<string> {
    const id = await Geolocation.watchPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    }, (position, err) => {
      if (err) {
        callback(null, err);
        return;
      }
      if (position) {
         callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          speed: position.coords.speed,
          heading: position.coords.heading,
        }, undefined);
      }
    });
    return id;
  },

  async clearWatch(id: string) {
    await Geolocation.clearWatch({ id });
  },

  async checkPermissions(): Promise<boolean> {
      try {
          const status = await Geolocation.checkPermissions();
          return status.location === 'granted';
      } catch (e) {
          console.error("Error checking permissions", e);
          return false;
      }
  },

  async requestPermissions(): Promise<boolean> {
      try {
          const status = await Geolocation.requestPermissions();
          return status.location === 'granted';
      } catch (e) {
          console.error("Error requesting permissions", e);
          return false;
      }
  }
};
