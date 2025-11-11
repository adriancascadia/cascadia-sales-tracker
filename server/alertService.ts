import * as db from './db';
import { notifyOwner } from './_core/notification';

// Configuration thresholds
const ROUTE_DEVIATION_THRESHOLD_METERS = 500; // 500 meters off route
const DELAY_THRESHOLD_MINUTES = 30; // 30 minutes behind schedule

/**
 * Calculate distance between two GPS coordinates in meters
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Check if a sales rep has deviated from their planned route
 */
export async function checkRouteDeviation(userId: number, routeId: number) {
  try {
    const route = await db.getRouteById(routeId);
    if (!route) return;

    const routeStops = await db.getRouteStopsByRouteId(routeId);
    if (!routeStops || routeStops.length === 0) return;

    const latestGpsTrack = await db.getLatestGpsTrackByUserId(userId);
    if (!latestGpsTrack) return;

    const userLat = parseFloat(latestGpsTrack.latitude);
    const userLon = parseFloat(latestGpsTrack.longitude);

    // Check distance to all planned stops
    let minDistance = Infinity;
    let nearestStop: any = null;

    for (const stop of routeStops) {
      const customer = await db.getCustomerById(stop.customerId);
      if (!customer || !customer.latitude || !customer.longitude) continue;

      const distance = calculateDistance(
        userLat,
        userLon,
        parseFloat(customer.latitude),
        parseFloat(customer.longitude)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestStop = { stop, customer };
      }
    }

    // If user is more than threshold meters from any planned stop, create alert
    if (minDistance > ROUTE_DEVIATION_THRESHOLD_METERS) {
      const allUsers = await db.getAllUsers();
      const user = allUsers.find(u => u.id === userId);
      const message = `${user?.name || `User ${userId}`} is ${Math.round(minDistance)}m away from the nearest planned stop on route "${route.routeName}".`;
      
      await db.createAlert({
        companyId: 1, // TODO: Get from context
        userId,
        routeId,
        alertType: 'route_deviation',
        severity: minDistance > 1000 ? 'high' : 'medium',
        message,
        metadata: JSON.stringify({
          distance: minDistance,
          nearestStop: nearestStop?.customer?.name,
          currentLocation: { lat: userLat, lon: userLon },
        }),
      });

      // Notify owner
      await notifyOwner({
        title: 'Route Deviation Alert',
        content: message,
      });
    }
  } catch (error) {
    console.error('Error checking route deviation:', error);
  }
}

/**
 * Check if a sales rep is significantly delayed
 */
export async function checkDelays(userId: number, routeId: number) {
  try {
    const routeStops = await db.getRouteStopsByRouteId(routeId);
    if (!routeStops || routeStops.length === 0) return;

    const now = new Date();
    const allUsers = await db.getAllUsers();
    const user = allUsers.find(u => u.id === userId);
    const route = await db.getRouteById(routeId);

    for (const stop of routeStops) {
      if (!stop.plannedArrival) continue;

      const plannedTime = new Date(stop.plannedArrival);
      const timeDiff = now.getTime() - plannedTime.getTime();
      const minutesLate = Math.floor(timeDiff / 60000);

      // Check if significantly delayed
      if (minutesLate > DELAY_THRESHOLD_MINUTES) {
        // Check if visit was completed
        const visits = await db.getVisitsByCustomerId(stop.customerId);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const completedVisit = visits.find(v => 
          v.userId === userId &&
          new Date(v.checkInTime) >= todayStart &&
          v.checkOutTime !== null
        );

        if (!completedVisit) {
          const customer = await db.getCustomerById(stop.customerId);
          const message = `${user?.name || `User ${userId}`} is ${minutesLate} minutes late for planned visit to ${customer?.name || 'customer'} on route "${route?.routeName}".`;
          
          await db.createAlert({
            companyId: 1, // TODO: Get from context
            userId,
            routeId,
            alertType: 'significant_delay',
            severity: minutesLate > 60 ? 'high' : 'medium',
            message,
            metadata: JSON.stringify({
              minutesLate,
              customerName: customer?.name,
              plannedArrival: plannedTime.toISOString(),
            }),
          });

          // Notify owner
          await notifyOwner({
            title: 'Significant Delay Alert',
            content: message,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking delays:', error);
  }
}

/**
 * Monitor all active routes and generate alerts
 */
export async function monitorAllRoutes() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const allUsers = await db.getAllUsers();

    for (const user of allUsers) {
      const routes = await db.getRoutesByDate(user.id, today);
      
      for (const route of routes) {
        if (route.status === 'in_progress') {
          await checkRouteDeviation(user.id, route.id);
          await checkDelays(user.id, route.id);
        }
      }
    }
  } catch (error) {
    console.error('Error monitoring routes:', error);
  }
}
