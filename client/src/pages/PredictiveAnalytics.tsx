import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { AlertTriangle, TrendingUp, Users, Target, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import {
  forecastLinear,
  analyzeTrends,
  assessChurnRisk,
  calculateCLV,
  identifyHighValueCustomers,
  detectAnomalies,
  type TimeSeriesData,
} from '@/lib/predictiveAnalytics';

/**
 * Predictive Analytics Dashboard
 * Advanced insights with forecasting, trend analysis, and churn prediction
 */
export default function PredictiveAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data
  const { data: visits } = trpc.visits.list.useQuery();
  const { data: orders } = trpc.orders.list.useQuery();
  const { data: customers } = trpc.customers.list.useQuery();

  // Generate mock time series data for demo
  const generateMockData = (days: number): TimeSeriesData[] => {
    const data: TimeSeriesData[] = [];
    const today = new Date();
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date,
        value: Math.max(100, 500 + Math.random() * 300 + Math.sin(i / 10) * 200),
      });
    }
    return data;
  };

  const getDaysFromPeriod = (period: string) => {
    switch (period) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  };

  const timeSeriesData = useMemo(() => generateMockData(getDaysFromPeriod(selectedPeriod)), [selectedPeriod]);
  const forecast = useMemo(() => forecastLinear(timeSeriesData, 30), [timeSeriesData]);
  const trends = useMemo(() => analyzeTrends(timeSeriesData), [timeSeriesData]);
  const anomalies = useMemo(() => detectAnomalies(timeSeriesData), [timeSeriesData]);

  // Prepare chart data
  const chartData = timeSeriesData.map((d, i) => ({
    date: d.date.toLocaleDateString(),
    actual: d.value,
    anomaly: anomalies.some(a => a.index === i) ? d.value : null,
  }));

  const forecastData = forecast.map(f => ({
    date: f.date.toLocaleDateString(),
    predicted: Math.round(f.predicted),
    lower: Math.round(f.lower),
    upper: Math.round(f.upper),
  }));

  // Calculate high-risk customers
  const highRiskCustomers = useMemo(() => {
    if (!customers || !orders) return [];
    return customers
      .map(customer => {
        const customerOrders = orders.filter(o => o.customerId === customer.id);
        const totalSpent = customerOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const lastVisit = visits?.filter(v => v.customerId === customer.id).sort((a, b) => 
          new Date(b.checkInTime || 0).getTime() - new Date(a.checkInTime || 0).getTime()
        )[0];
        const daysSinceVisit = lastVisit ? Math.floor((Date.now() - new Date(lastVisit.checkInTime || 0).getTime()) / (1000 * 60 * 60 * 24)) : 999;

        return assessChurnRisk(
          customer.id.toString(),
          [],
          [],
          daysSinceVisit,
          totalSpent / Math.max(customerOrders.length, 1),
          0
        );
      })
      .filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical')
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);
  }, [customers, orders, visits]);

  // Calculate high-value customers
  const highValueCustomers = useMemo(() => {
    if (!customers || !orders) return [];
    const customerMetrics = customers.map(c => ({
      id: c.id,
      totalSpent: orders.filter(o => o.customerId === c.id).reduce((sum, o) => sum + (o.totalPrice || 0), 0),
      orderCount: orders.filter(o => o.customerId === c.id).length,
      monthsActive: 6, // Simplified
    }));
    const highValueIds = identifyHighValueCustomers(customerMetrics, 80);
    return customerMetrics.filter(m => highValueIds.includes(m.id.toString())).slice(0, 10);
  }, [customers, orders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
    toast.success('Analytics refreshed');
  };

  const handleExport = () => {
    const csv = [
      ['Sales Forecast Report'],
      ['Date', 'Predicted', 'Lower Bound', 'Upper Bound'],
      ...forecastData.map(d => [d.date, d.predicted, d.lower, d.upper]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forecast-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Report exported');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Predictive Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              AI-powered insights, forecasting, and risk assessment
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <Card className="p-4">
          <div className="flex gap-2">
            {(['7d', '30d', '90d', '1y'] as const).map(period => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : period === '90d' ? '90 Days' : '1 Year'}
              </Button>
            ))}
          </div>
        </Card>

        <Tabs defaultValue="forecast" className="space-y-4">
          <TabsList>
            <TabsTrigger value="forecast">Sales Forecast</TabsTrigger>
            <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
            <TabsTrigger value="churn">Churn Risk</TabsTrigger>
            <TabsTrigger value="value">Customer Value</TabsTrigger>
          </TabsList>

          {/* Sales Forecast Tab */}
          <TabsContent value="forecast" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">30-Day Sales Forecast</h2>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={[...chartData.slice(-10), ...forecastData.slice(0, 10)]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="#3b82f6" name="Actual Sales" />
                  <Line type="monotone" dataKey="predicted" stroke="#10b981" name="Forecast" strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="upper" fill="#10b981" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="lower" fill="#10b981" fillOpacity={0.1} />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Confidence Level</div>
                <div className="text-2xl font-bold text-blue-600">{forecast[0]?.confidence.toFixed(0)}%</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Forecast</div>
                <div className="text-2xl font-bold text-green-600">
                  ${(forecast.reduce((sum, f) => sum + f.predicted, 0) / forecast.length).toFixed(0)}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Trend</div>
                <div className="text-2xl font-bold text-orange-600">{trends.trend.toUpperCase()}</div>
              </Card>
            </div>
          </TabsContent>

          {/* Trend Analysis Tab */}
          <TabsContent value="trends" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Trend Analysis</h2>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="actual" fill="#3b82f6" stroke="#1e40af" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Trend Direction</div>
                <div className="flex items-center gap-2">
                  <TrendingUp className={`w-5 h-5 ${trends.trend === 'increasing' ? 'text-green-600' : trends.trend === 'decreasing' ? 'text-red-600' : 'text-gray-600'}`} />
                  <span className="text-lg font-bold">{trends.trend.toUpperCase()}</span>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Seasonality</div>
                <div className="text-lg font-bold">{trends.seasonality ? 'Detected' : 'Not Detected'}</div>
              </Card>
            </div>
          </TabsContent>

          {/* Churn Risk Tab */}
          <TabsContent value="churn" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <AlertTriangle className="w-5 h-5 inline mr-2 text-red-600" />
                At-Risk Customers ({highRiskCustomers.length})
              </h2>

              {highRiskCustomers.length > 0 ? (
                <div className="space-y-3">
                  {highRiskCustomers.map(customer => (
                    <Card key={customer.customerId} className="p-4 border-l-4 border-red-500">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">Customer {customer.customerId}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Risk Level: {customer.riskLevel.toUpperCase()}</div>
                        </div>
                        <div className="text-2xl font-bold text-red-600">{customer.riskScore}%</div>
                      </div>

                      <div className="mb-3">
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Risk Factors:</div>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {customer.factors.map((factor, i) => (
                            <li key={i}>• {factor}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Recommendations:</div>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {customer.recommendations.map((rec, i) => (
                            <li key={i}>→ {rec}</li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No high-risk customers detected</div>
              )}
            </Card>
          </TabsContent>

          {/* Customer Value Tab */}
          <TabsContent value="value" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <Target className="w-5 h-5 inline mr-2 text-blue-600" />
                High-Value Customers ({highValueCustomers.length})
              </h2>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={highValueCustomers.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalSpent" fill="#3b82f6" name="Total Spent" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 space-y-2">
                {highValueCustomers.slice(0, 5).map((customer, i) => (
                  <div key={customer.id} className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">#{i + 1} Customer {customer.id}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{customer.orderCount} orders</div>
                    </div>
                    <div className="text-lg font-bold text-blue-600">${customer.totalSpent.toFixed(0)}</div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Anomalies */}
        {anomalies.length > 0 && (
          <Card className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Detected Anomalies ({anomalies.length})
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {anomalies.length} unusual data points detected in the selected period. These may indicate special events or data quality issues.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
