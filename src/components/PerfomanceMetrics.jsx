import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Activity, Target, Filter } from 'lucide-react';
import useSummaryData from '@/hooks/useSummaryData';

const PerformanceMetrics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [currentData, setCurrentData] = useState(null);
  const [previousData, setPreviousData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Create two separate instances of the hook for current and previous data
  const { summaryData: current, fetchSummaryData: fetchCurrent } = useSummaryData();
  const { summaryData: previous, fetchSummaryData: fetchPrevious } = useSummaryData();

  const periods = [
    { key: '3day', label: '3 Days', value: 3 },
    { key: 'weekly', label: 'Weekly', value: 7 },
    { key: 'monthly', label: 'Monthly', value: 30 },
    { key: 'quarterly', label: 'Quarterly', value: 90 },
    { key: 'yearly', label: 'Yearly', value: 365 }
  ];

  useEffect(() => {
    fetchPerformanceData();
  }, [selectedPeriod]);

  const calculateDateRanges = (periodKey) => {
    const now = new Date();
    let currentStart, currentEnd, previousStart, previousEnd;

    switch (periodKey) {
      case '3day':
        currentEnd = new Date(now);
        currentStart = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        previousEnd = new Date(currentStart.getTime() - 1);
        previousStart = new Date(previousEnd.getTime() - 3 * 24 * 60 * 60 * 1000);
        break;
      
      case 'weekly':
        // Current week (Sunday to today)
        currentEnd = new Date(now);
        currentStart = new Date(now);
        currentStart.setDate(now.getDate() - now.getDay());
        currentStart.setHours(0, 0, 0, 0);
        
        // Previous week
        previousEnd = new Date(currentStart.getTime() - 1);
        previousStart = new Date(previousEnd);
        previousStart.setDate(previousEnd.getDate() - 6);
        previousStart.setHours(0, 0, 0, 0);
        break;
      
      case 'monthly':
        // Current month
        currentEnd = new Date(now);
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Previous month
        previousEnd = new Date(currentStart.getTime() - 1);
        previousStart = new Date(previousEnd.getFullYear(), previousEnd.getMonth(), 1);
        break;
      
      case 'quarterly':
        // Current quarter
        currentEnd = new Date(now);
        const currentQuarter = Math.floor(now.getMonth() / 3);
        currentStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
        
        // Previous quarter
        previousEnd = new Date(currentStart.getTime() - 1);
        const previousQuarter = Math.floor(previousEnd.getMonth() / 3);
        previousStart = new Date(previousEnd.getFullYear(), previousQuarter * 3, 1);
        break;
      
      case 'yearly':
        // Current year
        currentEnd = new Date(now);
        currentStart = new Date(now.getFullYear(), 0, 1);
        
        // Previous year
        previousEnd = new Date(currentStart.getTime() - 1);
        previousStart = new Date(previousEnd.getFullYear(), 0, 1);
        break;
      
      default:
        return calculateDateRanges('weekly');
    }

    return {
      current: { start: currentStart, end: currentEnd },
      previous: { start: previousStart, end: previousEnd }
    };
  };

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const dateRanges = calculateDateRanges(selectedPeriod);
      
      // Fetch current period data
      await fetchCurrent('custom', dateRanges.current);
      
      // Fetch previous period data
      await fetchPrevious('custom', dateRanges.previous);
      
      // Update local state
      setCurrentData(current);
      setPreviousData(previous);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateChange = (currentVal, previousVal) => {
    if (!previousVal || previousVal === 0) return { value: 0, isPositive: true };
    const change = ((currentVal - previousVal) / previousVal) * 100;
    return {
      value: Math.abs(change),
      isPositive: change >= 0
    };
  };

  const getPeriodLabel = (periodKey) => {
    const period = periods.find(p => p.key === periodKey);
    return period ? period.label.toLowerCase() : 'period';
  };

  const metrics = [
    {
      title: 'Sales Growth',
      current: current?.totalSales || 0,
      previous: previous?.totalSales || 0,
      format: 'currency',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Order Growth',
      current: current?.totalOrders || 0,
      previous: previous?.totalOrders || 0,
      format: 'number',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Avg Order Value',
      current: current?.avgOrderValue || 0,
      previous: previous?.avgOrderValue || 0,
      format: 'currency',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading performance metrics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance Overview
              </CardTitle>
              
              {/* Period Filter */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 min-w-0">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex flex-wrap gap-1 w-full sm:w-auto min-w-0">
                  {periods.map((period) => (
                    <Button
                      key={period.key}
                      variant={selectedPeriod === period.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPeriod(period.key)}
                      className="text-xs sm:text-sm whitespace-nowrap px-2 py-1"
                    >
                      {period.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map((metric, index) => {
            const change = calculateChange(metric.current, metric.previous);
            const Icon = metric.icon;
            const TrendIcon = change.isPositive ? TrendingUp : TrendingDown;
            
            return (
              <div key={index} className={`p-4 rounded-lg border ${metric.bgColor}`}>
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                  <Badge 
                    variant={change.isPositive ? 'default' : 'destructive'}
                    className="flex items-center gap-1"
                  >
                    <TrendIcon className="h-3 w-3" />
                    {change.value.toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="text-2xl font-bold">
                    {metric.format === 'currency' 
                      ? `PKR ${metric.current.toLocaleString()}`
                      : metric.current.toLocaleString()
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">{metric.title}</div>
                  <div className="text-xs text-muted-foreground">
                    vs last {getPeriodLabel(selectedPeriod)}: {metric.format === 'currency' 
                      ? `PKR ${metric.previous.toLocaleString()}`
                      : metric.previous.toLocaleString()
                    }
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Quick Insights */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Quick Insights</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            {current?.totalSales > (previous?.totalSales || 0) && (
              <p>• Sales are trending upward compared to last {getPeriodLabel(selectedPeriod)}</p>
            )}
            {current?.avgOrderValue > (previous?.avgOrderValue || 0) && (
              <p>• Average order value has improved</p>
            )}
            {current?.totalOrders > (previous?.totalOrders || 0) && (
              <p>• Order volume is increasing</p>
            )}
            {current?.totalSales <= (previous?.totalSales || 0) && (
              <p>• Consider analyzing top-selling products for improvement opportunities</p>
            )}
            {selectedPeriod === '3day' && (
              <p>• Short-term performance: Focus on daily trends and immediate improvements</p>
            )}
            {selectedPeriod === 'yearly' && (
              <p>• Long-term performance: Review annual growth patterns and strategic goals</p>
            )}
          </div>
        </div>

        {/* Period Summary */}
        <div className="mt-4 text-center">
          <Badge variant="outline" className="text-xs">
            Comparing current {getPeriodLabel(selectedPeriod)} vs previous {getPeriodLabel(selectedPeriod)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;