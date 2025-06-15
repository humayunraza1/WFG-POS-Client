import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  ShoppingCart, 
  Calculator,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DashboardStats = ({ 
  sales, 
  orders, 
  totalExpenses, 
  cashInHand, 
  pendingPayment = 0, // New prop for pending payments
  onOpenRegister, 
  isRegisterOpen, 
  isLoading = false 
}) => {
  // Calculate total cash: actual sales received + cash in hand - expenses
  const totalCash = (sales || 0) + (cashInHand || 0) - (totalExpenses || 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
      {/* Today's Sales (Actual Cash Received) */}
      <Card className="h-32">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium">Cash Received</CardTitle>
          <DollarSign className="h-3 w-3 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-lg font-bold flex items-center gap-1">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `PKR ${sales.toLocaleString()}`
            )}
          </div>
          <p className="text-xs text-muted-foreground">Today's payments</p>
        </CardContent>
      </Card>
      
      {/* Pending Payment */}
      <Card className="h-32 bg-red-500 border-red-600">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium text-white">Pending Payment</CardTitle>
          <AlertCircle className="h-3 w-3 text-white" />
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-lg font-bold flex items-center gap-1 text-white">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `PKR ${pendingPayment.toLocaleString()}`
            )}
          </div>
          <p className="text-xs text-red-100">Outstanding amount</p>
        </CardContent>
      </Card>
      
      {/* Today's Orders */}
      <Card className="h-32">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium">Today's Orders</CardTitle>
          <ShoppingCart className="h-3 w-3 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-lg font-bold flex items-center gap-1">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              orders
            )}
          </div>
          <p className="text-xs text-muted-foreground">Total orders</p>
        </CardContent>
      </Card>

      {/* Total Cash */}
      <Card className="h-32">
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
      <Card className="h-32">
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
      
      {/* Cash Register - Only show Open Register button if register is closed */}
      <Card className="h-32">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium">Cash Register</CardTitle>
          <Calculator className="h-3 w-3 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pb-2 space-y-1">
          {!isRegisterOpen ? (
            <>
              <Button 
                onClick={onOpenRegister} 
                size="sm"
                className="w-full h-6 text-xs" 
                variant="default"
              >
                Open Register
              </Button>
              <Badge 
                variant="secondary" 
                className="text-xs px-2 py-0"
              >
                Closed
              </Badge>
            </>
          ) : (
            <>
              <div className="w-full h-6 flex items-center justify-center text-xs text-green-600 font-medium">
                Register Active
              </div>
              <Badge 
                variant="default" 
                className="text-xs px-2 py-0 bg-green-600"
              >
                Active
              </Badge>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;