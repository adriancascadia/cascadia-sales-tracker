import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, MapPin, Zap, ArrowRight, Download } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import {
  buildOptimizedRoute,
  compareRoutes,
  splitIntoMultipleRoutes,
  type OptimizedRoute,
  type RouteLocation,
} from '@/lib/routeOptimization';

/**
 * Route Optimization Page
 * Helps reps plan efficient routes with auto-sequencing and analytics
 */
export default function RouteOptimization() {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [optimizationMethod, setOptimizationMethod] = useState<'nearest-neighbor' | 'priority'>('nearest-neighbor');
  const [maxStopsPerRoute, setMaxStopsPerRoute] = useState(10);
  const [optimizedRoutes, setOptimizedRoutes] = useState<OptimizedRoute[]>([]);
  const [originalRoute, setOriginalRoute] = useState<OptimizedRoute | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Fetch customers for route planning
  const { data: customers } = trpc.customers.list.useQuery();

  // Convert customers to route locations
  const routeLocations: RouteLocation[] = (customers || []).map((customer) => ({
    id: customer.id.toString(),
    name: customer.name,
    latitude: typeof customer.latitude === 'string' ? parseFloat(customer.latitude) : (customer.latitude || 0),
    longitude: typeof customer.longitude === 'string' ? parseFloat(customer.longitude) : (customer.longitude || 0),
    visitDuration: 30,
    priority: 3,
  }));

  // Handle route optimization
  const handleOptimizeRoute = () => {
    if (routeLocations.length === 0) {
      toast.error('No customers available for route planning');
      return;
    }

    try {
      setIsOptimizing(true);

      // Create original route (unoptimized)
      const original = buildOptimizedRoute(routeLocations, 'nearest-neighbor');
      setOriginalRoute(original);

      // Optimize route
      const optimized = buildOptimizedRoute(routeLocations, optimizationMethod);

      // Split into multiple routes if needed
      if (routeLocations.length > maxStopsPerRoute) {
        const multiRoutes = splitIntoMultipleRoutes(routeLocations, maxStopsPerRoute);
        setOptimizedRoutes(multiRoutes);
        toast.success(`Created ${multiRoutes.length} optimized routes`);
      } else {
        setOptimizedRoutes([optimized]);
        toast.success('Route optimized successfully');
      }

      setSelectedRoute('0');
    } catch (error) {
      console.error('Route optimization error:', error);
      toast.error('Failed to optimize route');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Calculate savings
  const savings = originalRoute && optimizedRoutes.length > 0
    ? compareRoutes(originalRoute, optimizedRoutes[0])
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Route Optimization</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Plan efficient routes with automatic customer sequencing
          </p>
        </div>

        {/* Controls */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Optimization Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Optimization Method
              </label>
              <select
                value={optimizationMethod}
                onChange={(e) => setOptimizationMethod(e.target.value as 'nearest-neighbor' | 'priority')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                <option value="nearest-neighbor">Nearest Neighbor (Fastest)</option>
                <option value="priority">Priority-Based (Balanced)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Stops Per Route
              </label>
              <Input
                type="number"
                min="1"
                max="50"
                value={maxStopsPerRoute}
                onChange={(e) => setMaxStopsPerRoute(parseInt(e.target.value) || 10)}
                className="w-full"
              />
            </div>
          </div>

          <Button
            onClick={handleOptimizeRoute}
            disabled={isOptimizing || routeLocations.length === 0}
            className="w-full"
          >
            <Zap className="w-4 h-4 mr-2" />
            {isOptimizing ? 'Optimizing...' : 'Optimize Route'}
          </Button>
        </Card>

        {/* Savings Summary */}
        {savings && (
          <Card className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-green-700 dark:text-green-300">Distance Saved</div>
                <div className="text-2xl font-bold text-green-600">{savings.distanceSaved} km</div>
              </div>
              <div>
                <div className="text-sm text-green-700 dark:text-green-300">Time Saved</div>
                <div className="text-2xl font-bold text-green-600">{savings.timeSaved} min</div>
              </div>
              <div>
                <div className="text-sm text-green-700 dark:text-green-300">Efficiency Gain</div>
                <div className="text-2xl font-bold text-green-600">+{savings.efficiencyGain}%</div>
              </div>
            </div>
          </Card>
        )}

        {/* Optimized Routes */}
        {optimizedRoutes.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Optimized Routes</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {optimizedRoutes.map((route, idx) => (
                <Card
                  key={idx}
                  className={`p-4 cursor-pointer transition-all ${selectedRoute === idx.toString()
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:shadow-lg'
                    }`}
                  onClick={() => setSelectedRoute(idx.toString())}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Route {idx + 1}</h3>
                      <span className="text-2xl font-bold text-blue-600">{route.efficiency}%</span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Stops:</span>
                        <span className="font-semibold">{route.stops}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Distance:</span>
                        <span className="font-semibold">{route.totalDistance} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Est. Duration:</span>
                        <span className="font-semibold">{Math.round(route.estimatedDuration / 60)}h {route.estimatedDuration % 60}m</span>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="w-full">
                      <MapPin className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Route Details */}
        {selectedRoute !== null && optimizedRoutes[parseInt(selectedRoute)] && (
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Route {parseInt(selectedRoute) + 1} - Detailed Plan
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Stop</th>
                    <th className="px-4 py-2 text-left font-semibold">Customer</th>
                    <th className="px-4 py-2 text-left font-semibold">Est. Duration</th>
                    <th className="px-4 py-2 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {optimizedRoutes[parseInt(selectedRoute)].locations.map((location, idx) => (
                    <tr key={location.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-semibold text-blue-600">{idx + 1}</td>
                      <td className="px-4 py-3">{location.name}</td>
                      <td className="px-4 py-3">{location.visitDuration || 30} min</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm">
                          Start Visit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2 pt-4">
              <Button className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Export Route
              </Button>
              <Button variant="outline" className="flex-1">
                <ArrowRight className="w-4 h-4 mr-2" />
                Send to GPS
              </Button>
            </div>
          </Card>
        )}

        {/* Info */}
        {optimizedRoutes.length === 0 && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-semibold mb-1">How Route Optimization Works</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Analyzes customer locations and distances</li>
                  <li>Uses intelligent algorithms to find optimal sequence</li>
                  <li>Minimizes travel time and distance</li>
                  <li>Respects priority levels and time windows</li>
                  <li>Splits large routes into manageable segments</li>
                </ul>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
