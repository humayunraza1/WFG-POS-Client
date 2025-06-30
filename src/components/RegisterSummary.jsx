import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DollarSign, 
  ShoppingCart, 
  Receipt, 
  TrendingUp,
  Clock,
  User,
  Wallet,
  CreditCard,
  Loader2
} from 'lucide-react';

const RegisterSummary = ({ summary, loading, selectedSessionId }) => {
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Select a register to view summary</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const summaryCards = [
    {
      title: 'Total Sales',
      value: formatCurrency(summary.totalSales),
      icon: TrendingUp,
      description: `${summary.orderCount} orders`
    },
    {
      title: 'Cash Received',
      value: formatCurrency(summary.cashRecvd),
      icon: Wallet,
      description: `Expected: ${formatCurrency(summary.expectedCash)}`
    },
    {
      title: 'Online Received',
      value: formatCurrency(summary.onlineRecvd),
      icon: CreditCard,
      description: `Expected: ${formatCurrency(summary.expectedOnline)}`
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(summary.totalExpenses),
      icon: Receipt,
      description: `${summary.expenses?.length || 0} expenses`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">
            {selectedSessionId ? 'Register Summary' : 'All Registers Summary'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedSessionId ? `Session: ${selectedSessionId.slice(-8)}...` : `${summary.sessionCount} active sessions`}
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {selectedSessionId ? 'Single Register' : 'All Registers'}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <card.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.title}</p>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Register Details */}
      {summary.registers && summary.registers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Register Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-64">
              <div className="space-y-4">
                {summary.registers.map((register, index) => {
                  const { date, time } = formatDate(register.openedAt);
                  return (
                    <div key={register.sessionId}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {register.cashier.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{register.cashier.username}</p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>Opened: {date} at {time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Start Cash: {formatCurrency(register.startCash)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Expected: {formatCurrency(register.expectedBalance)}
                          </p>
                        </div>
                      </div>
                      {index < summary.registers.length - 1 && <Separator className="mt-4" />}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      {summary.orders && summary.orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Recent Orders ({summary.orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-80">
              <div className="space-y-3">
                {summary.orders.map((order, index) => {
                  const { date, time } = formatDate(order.dateOrdered);
                  return (
                    <div key={order._id}>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {order.paymentType}
                            </Badge>
                            <Badge 
                              variant={order.paymentStatus === 'paid' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {order.paymentStatus}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {date} at {time} • {order.items.length} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(order.finalPrice)}</p>
                          {order.outstandingPayment > 0 && (
                            <p className="text-xs text-destructive">
                              Outstanding: {formatCurrency(order.outstandingPayment)}
                            </p>
                          )}
                        </div>
                      </div>
                      {index < summary.orders.length - 1 && <Separator className="mt-3" />}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Balance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Balance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Opening Balance</p>
              <p className="text-xl font-semibold">{formatCurrency(summary.openingBalance)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Expected Cash</p>
              <p className="text-xl font-semibold">{formatCurrency(summary.expectedCash)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Closing Balance</p>
              <p className="text-xl font-semibold">
                {summary.closingBalance > 0 
                  ? formatCurrency(summary.closingBalance)
                  : 'Not closed'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterSummary;