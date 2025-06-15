import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, Receipt } from 'lucide-react';

const SessionMetrics = ({ session }) => {
  const formatCurrency = (amount) => {
    return `PKR ${(amount || 0).toLocaleString()}`;
  };

  const metrics = [
    {
      title: 'Total Sales',
      value: formatCurrency(session.totalSales),
      icon: DollarSign,
      description: `${session.orders?.length || 0} orders`
    },
    {
      title: 'Orders',
      value: session.orders?.length || 0,
      icon: ShoppingCart,
      description: 'Total processed'
    },
    {
      title: 'Expenses',
      value: formatCurrency(session.totalExpenses),
      icon: Receipt,
      description: `${session.expenses?.length || 0} entries`
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="text-center">
            <CardHeader className="flex flex-col items-center space-y-2 pb-3">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl font-bold mb-1">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SessionMetrics;