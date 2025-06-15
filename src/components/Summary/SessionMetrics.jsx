import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, Receipt } from 'lucide-react';

const SessionMetrics = ({ session }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount || 0);
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
    <div className="grid grid-cols-3 gap-3 max-w-2xl">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="text-center">
            <CardHeader className="flex flex-col items-center space-y-1 pb-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-xs font-medium">
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg font-bold">{metric.value}</div>
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