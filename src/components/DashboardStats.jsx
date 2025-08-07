import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  ShoppingCart, 
  Calculator,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSelector } from 'react-redux';
import { useGetDailyStatsQuery } from '../features/orders/ordersAPI';
import { useEffect } from 'react';
import { useGetExpensesBySessionQuery } from '../features/expense/expenseAPI';
import { selectTotalExpenses } from '../features/expense/expenseSlice';

const DashboardStats = () => {
  const {sessionId,registerData} = useSelector((state)=> state.register)
  const { data: stats, isFetching:isLoading } = useGetDailyStatsQuery(sessionId, {
  skip: !sessionId,
});
const totalExpenses = useSelector(selectTotalExpenses);

  // Calculate total cash: actual sales received + cash in hand - expenses
  const totalCash = (stats?.cashRecvd || 0) + (registerData?.startCash || 0) - (totalExpenses || 0);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      {/* Today's Sales */}
      <Card className="min-h-32">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium">Total Sales</CardTitle>
          <DollarSign className="h-3 w-3 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-lg font-bold flex items-center gap-1">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `PKR ${stats?.totalSales.toLocaleString()||0}`
            )}
          </div>
          <p className="text-xs text-muted-foreground">Today's sales</p>
        </CardContent>
      </Card>
      {/* Today's Sales (Actual Cash Received) */}
      <Card className="min-h-32">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium">Cash Received</CardTitle>
          <DollarSign className="h-3 w-3 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-lg font-bold flex items-center gap-1">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `PKR ${stats?.cashRecvd.toLocaleString()||0}`
            )}
          </div>
          <p className="text-xs text-muted-foreground">Today's payments</p>
        </CardContent>
      </Card>
      {/* Online Payments Received */}
<Card className="min-h-32">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
    <CardTitle className="text-xs font-medium">Online Payments</CardTitle>
    <CreditCard className="h-3 w-3 text-muted-foreground" />
  </CardHeader>
  <CardContent className="pb-2">
    <div className="text-lg font-bold flex items-center gap-1">
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        `PKR ${stats?.onlinePayment || 0}`
      )}
    </div>
    <p className="text-xs text-muted-foreground">Digital transfers</p>
  </CardContent>
</Card>
      {/* Pending Payment */}
      <Card className="min-h-32 bg-red-500 border-red-600">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium text-white">Pending Payment</CardTitle>
          <AlertCircle className="h-3 w-3 text-white" />
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-lg font-bold flex items-center gap-1 text-white">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `PKR ${stats?.totalPendingPayment.toLocaleString()||0}`
            )}
          </div>
          <p className="text-xs text-red-100">Outstanding amount</p>
        </CardContent>
      </Card>
      
      {/* Today's Orders */}
      <Card className="min-h-32">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium">Today's Orders</CardTitle>
          <ShoppingCart className="h-3 w-3 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-lg font-bold flex items-center gap-1">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              stats?.orderCount || 0
            )}
          </div>
          <p className="text-xs text-muted-foreground">Total orders</p>
        </CardContent>
      </Card>

      {/* Total Cash */}
      <Card className="min-h-32">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium">Total Cash</CardTitle>
          <TrendingUp className="h-3 w-3 text-green-600" />
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-lg font-bold flex items-center gap-1 text-green-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `PKR ${totalCash.toLocaleString()}`
            )}
          </div>
          <p className="text-xs text-muted-foreground">Available cash</p>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card className="min-h-32">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-3 w-3 text-red-600" />
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-lg font-bold flex items-center gap-1 text-red-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `PKR ${(totalExpenses || 0).toLocaleString()}`
            )}
          </div>
          <p className="text-xs text-muted-foreground">Total spent</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;