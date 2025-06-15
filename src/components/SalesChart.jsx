import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import useSalesChart from '@/hooks/useSalesChart';

const SalesChart = ({ type = 'overview' }) => {
  const [chartType, setChartType] = useState('line');
  const [period, setPeriod] = useState('weekly');
  const [metric, setMetric] = useState('revenue');
  
  const { chartData, loading, error, fetchChartData } = useSalesChart();

  useEffect(() => {
    fetchChartData(type, period, metric);
  }, [type, period, metric]);

  const chartTypes = [
    { value: 'line', label: 'Line Chart', icon: TrendingUp },
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'pie', label: 'Pie Chart', icon: PieChartIcon }
  ];

  const periods = [
    { value: 'daily', label: 'Last 7 Days' },
    { value: 'weekly', label: 'Last 4 Weeks' },
    { value: 'monthly', label: 'Last 6 Months' },
    { value: 'yearly', label: 'Last 3 Years' }
  ];

  const metrics = [
    { value: 'revenue', label: 'Revenue (PKR)' },
    { value: 'orders', label: 'Number of Orders' },
    { value: 'items', label: 'Items Sold' },
    { value: 'avg_order', label: 'Average Order Value' }
  ];

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#d084d0', '#8dd1e1'];

  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No data available for the selected period
        </div>
      );
    }

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  metric === 'revenue' || metric === 'avg_order' ? `PKR ${value.toLocaleString()}` : value,
                  metrics.find(m => m.value === metric)?.label
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  metric === 'revenue' || metric === 'avg_order' ? `PKR ${value.toLocaleString()}` : value,
                  metrics.find(m => m.value === metric)?.label
                ]}
              />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ period, value, percent }) => 
                  `${period}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [
                  metric === 'revenue' || metric === 'avg_order' ? `PKR ${value.toLocaleString()}` : value,
                  metrics.find(m => m.value === metric)?.label
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading chart data...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-destructive">Error loading chart: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {type === 'overview' ? 'Sales Overview' : 'Sales Trends'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chart Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Chart Type:</span>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chartTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Period:</span>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Metric:</span>
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metrics.map((metric) => (
                  <SelectItem key={metric.value} value={metric.value}>
                    {metric.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full">
          {renderChart()}
        </div>

        {/* Chart Summary */}
        {chartData && chartData.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-bold">
                {metric === 'revenue' || metric === 'avg_order' 
                  ? `PKR ${Math.max(...chartData.map(d => d.value)).toLocaleString()}`
                  : Math.max(...chartData.map(d => d.value))
                }
              </div>
              <div className="text-sm text-muted-foreground">Peak</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {metric === 'revenue' || metric === 'avg_order' 
                  ? `PKR ${Math.min(...chartData.map(d => d.value)).toLocaleString()}`
                  : Math.min(...chartData.map(d => d.value))
                }
              </div>
              <div className="text-sm text-muted-foreground">Lowest</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {metric === 'revenue' || metric === 'avg_order' 
                  ? `PKR ${(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length).toLocaleString()}`
                  : Math.round(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length)
                }
              </div>
              <div className="text-sm text-muted-foreground">Average</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {metric === 'revenue' || metric === 'avg_order' 
                  ? `PKR ${chartData.reduce((sum, d) => sum + d.value, 0).toLocaleString()}`
                  : chartData.reduce((sum, d) => sum + d.value, 0)
                }
              </div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesChart;