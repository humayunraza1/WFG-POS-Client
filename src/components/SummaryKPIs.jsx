import { DollarSign, ShoppingCart, Package, TrendingUp, Calculator } from 'lucide-react';

const SummaryKPIs = ({ data, period }) => {
  const kpis = [
    {
      title: 'Total Sales',
      value: `PKR ${data?.totalSales?.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Orders',
      value: data?.totalOrders || '0',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Items Sold',
      value: data?.totalItems || '0',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Avg Order Value',
      value: `PKR ${data?.avgOrderValue?.toLocaleString() || '0'}`,
      icon: Calculator,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Daily Average',
      value: `PKR ${data?.dailyAverage?.toLocaleString() || '0'}`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      show: period !== 'all'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {kpis.filter(kpi => kpi.show !== false).map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div key={index} className={`p-4 rounded-lg border ${kpi.bgColor}`}>
            <div className="flex items-center justify-between mb-2">
              <Icon className={`h-5 w-5 ${kpi.color}`} />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="text-sm text-muted-foreground">{kpi.title}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryKPIs;