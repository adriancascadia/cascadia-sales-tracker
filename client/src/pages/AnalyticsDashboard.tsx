import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, DollarSign, Target } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalVisits: number;
  conversionRate: number;
  growthRate: number;
  topPerformers: Array<{
    userId: number;
    name: string;
    email: string;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    visitsCompleted: number;
    conversionRate: number;
    efficiencyScore: number;
    ranking: number;
  }>;
  revenueForecast: Array<{
    date: string;
    predictedRevenue: number;
    confidence: number;
    trend: "increasing" | "decreasing" | "stable";
  }>;
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<30 | 60 | 90>(30);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration - in production, this would come from tRPC
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAnalyticsData({
        totalRevenue: 125000,
        totalOrders: 450,
        averageOrderValue: 277.78,
        totalVisits: 520,
        conversionRate: 86.5,
        growthRate: 12.5,
        topPerformers: [
          {
            userId: 1,
            name: "Sarah Johnson",
            email: "sarah@cascadiafoodbev.com",
            totalOrders: 85,
            totalRevenue: 28500,
            averageOrderValue: 335.29,
            visitsCompleted: 95,
            conversionRate: 89.5,
            efficiencyScore: 92,
            ranking: 1,
          },
          {
            userId: 2,
            name: "Mike Chen",
            email: "mike@cascadiafoodbev.com",
            totalOrders: 72,
            totalRevenue: 22400,
            averageOrderValue: 311.11,
            visitsCompleted: 88,
            conversionRate: 81.8,
            efficiencyScore: 85,
            ranking: 2,
          },
          {
            userId: 3,
            name: "Jessica Martinez",
            email: "jessica@cascadiafoodbev.com",
            totalOrders: 68,
            totalRevenue: 19800,
            averageOrderValue: 291.18,
            visitsCompleted: 82,
            conversionRate: 82.9,
            efficiencyScore: 83,
            ranking: 3,
          },
          {
            userId: 4,
            name: "David Park",
            email: "david@cascadiafoodbev.com",
            totalOrders: 65,
            totalRevenue: 18200,
            averageOrderValue: 280,
            visitsCompleted: 78,
            conversionRate: 83.3,
            efficiencyScore: 81,
            ranking: 4,
          },
          {
            userId: 5,
            name: "Emma Wilson",
            email: "emma@cascadiafoodbev.com",
            totalOrders: 60,
            totalRevenue: 16100,
            averageOrderValue: 268.33,
            visitsCompleted: 77,
            conversionRate: 77.9,
            efficiencyScore: 78,
            ranking: 5,
          },
        ],
        revenueForecast: [
          { date: "2025-11-08", predictedRevenue: 4200, confidence: 95, trend: "increasing" },
          { date: "2025-11-09", predictedRevenue: 4350, confidence: 94, trend: "increasing" },
          { date: "2025-11-10", predictedRevenue: 4500, confidence: 93, trend: "increasing" },
          { date: "2025-11-11", predictedRevenue: 4400, confidence: 92, trend: "stable" },
          { date: "2025-11-12", predictedRevenue: 4600, confidence: 91, trend: "increasing" },
          { date: "2025-11-13", predictedRevenue: 4750, confidence: 90, trend: "increasing" },
          { date: "2025-11-14", predictedRevenue: 4550, confidence: 88, trend: "stable" },
        ],
      });
      setLoading(false);
    }, 500);
  }, [timeRange]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">Loading analytics...</div>
      </DashboardLayout>
    );
  }

  if (!analyticsData) {
    return (
      <DashboardLayout>
        <div className="p-8">No analytics data available</div>
      </DashboardLayout>
    );
  }

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Performance metrics and insights for your sales team</p>
          </div>
          <div className="flex gap-2">
            {[30, 60, 90].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days as 30 | 60 | 90)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === days
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(analyticsData.totalRevenue / 1000).toFixed(1)}K</div>
              <p className="text-xs text-green-600 mt-1">
                ↑ {analyticsData.growthRate.toFixed(1)}% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalOrders}</div>
              <p className="text-xs text-gray-600 mt-1">
                Avg: ${analyticsData.averageOrderValue.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-gray-600 mt-1">
                {analyticsData.totalVisits} visits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.topPerformers.length}</div>
              <p className="text-xs text-gray-600 mt-1">Active reps</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Forecast Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Forecast</CardTitle>
            <CardDescription>Predicted daily revenue for the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.revenueForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="predictedRevenue"
                  stroke="#3b82f6"
                  name="Predicted Revenue"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Ranked by efficiency score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topPerformers.map((performer) => (
                  <div key={performer.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold">{performer.name}</div>
                      <div className="text-sm text-gray-600">{performer.totalOrders} orders • ${(performer.totalRevenue / 1000).toFixed(1)}K</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">#{performer.ranking}</div>
                      <div className="text-sm text-gray-600">{performer.efficiencyScore}% score</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Efficiency Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Efficiency Distribution</CardTitle>
              <CardDescription>Team efficiency scores breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.topPerformers}
                    dataKey="efficiencyScore"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {analyticsData.topPerformers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Performance Metrics</CardTitle>
            <CardDescription>Complete breakdown of each rep's performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Rep Name</th>
                    <th className="text-right py-3 px-4 font-semibold">Orders</th>
                    <th className="text-right py-3 px-4 font-semibold">Revenue</th>
                    <th className="text-right py-3 px-4 font-semibold">Avg Order</th>
                    <th className="text-right py-3 px-4 font-semibold">Visits</th>
                    <th className="text-right py-3 px-4 font-semibold">Conversion</th>
                    <th className="text-right py-3 px-4 font-semibold">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.topPerformers.map((performer) => (
                    <tr key={performer.userId} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{performer.name}</td>
                      <td className="text-right py-3 px-4">{performer.totalOrders}</td>
                      <td className="text-right py-3 px-4">${(performer.totalRevenue / 1000).toFixed(1)}K</td>
                      <td className="text-right py-3 px-4">${performer.averageOrderValue.toFixed(0)}</td>
                      <td className="text-right py-3 px-4">{performer.visitsCompleted}</td>
                      <td className="text-right py-3 px-4">{performer.conversionRate.toFixed(1)}%</td>
                      <td className="text-right py-3 px-4 font-semibold text-blue-600">{performer.efficiencyScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
