import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DollarSign, ShoppingCart, Receipt, Wallet, User, CreditCard, Banknote, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import SessionMetrics from './SessionMetrics';
import SessionOrdersTable from './SessionOrdersTable';
import SessionExpensesTable from './SessionExpensesTable';
import SessionDeletedOrdersTable from './SessionDeletedOrdersTable';

const SessionDetailDrawer = ({ session, isOpen, onClose }) => {
  if (!session) return null;
  //console.log('Session Detail:', session);
  console.log('Session Orders:', session);
  const formatCurrency = (amount) => {
    return `PKR ${(amount || 0).toLocaleString()}`;
  };
  
  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'dd MMM yyyy, h:mm a');
  };

  // Function to get manager badge style
  const getManagerBadgeStyle = (manager) => {
    const styles = {
      'Hamza': { backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' }, // Red
      'Wajeeh': { backgroundColor: '#22c55e', color: 'white', borderColor: '#22c55e' }, // Green
      'Talal': { backgroundColor: '#3b82f6', color: 'white', borderColor: '#3b82f6' } // Blue
    };
    return styles[manager] || {};
  };

  // Calculate cash discrepancy
  const cashDiscrepancy = (session.expectedBalance || 0) - (session.closingBalance || 0);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl overflow-y-auto p-4 sm:p-6">
        <SheetHeader className="pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <SheetTitle className="text-lg sm:text-xl">
              Register Session Details
            </SheetTitle>
            {session.manager && (
              <Badge 
                style={getManagerBadgeStyle(session.manager)}
                className="font-medium w-fit"
              >
                <User className="h-3 w-3 mr-1" />
                {session.manager}
              </Badge>
            )}
          </div>
          <SheetDescription className="text-sm sm:text-base">
            <div className="flex flex-col gap-1">
              <span>Session from {formatDateTime(session.openedAt)}</span>
              {session.closedAt && <span>to {formatDateTime(session.closedAt)}</span>}
              <div className="flex items-center gap-2 mt-2">
                <span>Status:</span>
                <Badge variant={session.isOpen ? 'destructive' : 'default'} className="text-xs sm:text-sm">
                  {session.isOpen ? 'Open' : 'Closed'}
                </Badge>
              </div>
            </div>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 sm:space-y-8 w-full">
          {/* Session Metrics */}
          <div>
            <SessionMetrics session={session} />
          </div>

          <Separator className="my-4 sm:my-6" />
      
          {/* Cash & Payment Information */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
              <Wallet className="h-4 sm:h-5 w-4 sm:w-5" />
              Cash & Payment Information
            </h3>
            
            {/* Cash Flow Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <Card className="text-center">
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-medium flex items-center justify-center gap-1">
                    <Banknote className="h-3 w-3" />
                    Starting Balance
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm font-bold">
                    {formatCurrency(session.startCash)}
                  </div>
                </CardContent>
              </Card>

              {session.closingBalance !== undefined && (
                <Card className="text-center">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs font-medium flex items-center justify-center gap-1">
                      <Banknote className="h-3 w-3" />
                      Final Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm font-bold">
                      {formatCurrency(session.closingBalance)}
                    </div>
                  </CardContent>
                </Card>
              )}

              {session.expectedBalance !== undefined && (
                <Card className="text-center">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs font-medium flex items-center justify-center gap-1">
                      <Wallet className="h-3 w-3" />
                      Expected Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm font-bold">
                      {formatCurrency(session.expectedBalance)}
                    </div>
                  </CardContent>
                </Card>
              )}

              {session.expectedBalance !== undefined && session.closingBalance !== undefined && (
                <Card className={`text-center ${cashDiscrepancy !== 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <CardHeader className="pb-1">
                    <CardTitle className={`text-xs font-medium flex items-center justify-center gap-1 ${cashDiscrepancy !== 0 ? 'text-red-700' : 'text-green-700'}`}>
                      <DollarSign className="h-3 w-3" />
                      Discrepancy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className={`text-sm font-bold ${cashDiscrepancy !== 0 ? 'text-red-700' : 'text-green-700'}`}>
                      {formatCurrency(Math.abs(cashDiscrepancy))}
                      {cashDiscrepancy !== 0 && (
                        <span className="text-xs block">{cashDiscrepancy > 0 ? 'Short' : 'Over'}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Payment Breakdown Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Cash Payments */}
              <Card className="text-center bg-orange-100 border-orange-300 text-orange-800">
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-medium flex items-center justify-center gap-1 text-green-700">
                    <Banknote className="h-3 w-3" />
                    Cash Expected
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm font-bold text-green-700">
                    {formatCurrency(session.expectedCash)}
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center bg-green-50 border-green-200">
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-medium flex items-center justify-center gap-1 text-green-700">
                    <Banknote className="h-3 w-3" />
                    Cash Received
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm font-bold text-green-700">
                    {formatCurrency(session.cashRecvd)}
                  </div>
                </CardContent>
              </Card>

              {/* Online Payments */}
              <Card className="text-center bg-blue-100 border-blue-300 text-blue-800">
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-medium flex items-center justify-center gap-1 text-blue-700">
                    <CreditCard className="h-3 w-3" />
                    Online Expected
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm font-bold text-blue-700">
                    {formatCurrency(session.expectedOnline)}
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center bg-blue-50 border-blue-200">
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-medium flex items-center justify-center gap-1 text-blue-700">
                    <CreditCard className="h-3 w-3" />
                    Online Received
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm font-bold text-blue-700">
                    {formatCurrency(session.onlineRecvd)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Deleted Orders Summary */}
{(session.deletedSales > 0 ||
  session.deletedCash > 0 ||
  session.deletedOnline > 0) && (
  <>
    <Separator className="my-4 sm:my-6" />
    <div>
      <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 text-red-700">
        <Trash2 className="h-4 sm:h-5 w-4 sm:w-5" />
        Deleted Orders Summary
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Deleted Cash Orders */}
        <Card className="text-center bg-red-50 border-red-200">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium flex items-center justify-center gap-1 text-red-700">
              <Banknote className="h-3 w-3" />
              Deleted Cash
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm font-bold text-red-700">
              {formatCurrency(session.deletedCash)}
            </div>
          </CardContent>
        </Card>

        {/* Deleted Online Orders */}
        <Card className="text-center bg-red-50 border-red-200">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium flex items-center justify-center gap-1 text-red-700">
              <CreditCard className="h-3 w-3" />
              Deleted Online
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm font-bold text-red-700">
              {formatCurrency(session.deletedOnline)}
            </div>
          </CardContent>
        </Card>

        {/* Total Deleted Sales */}
        <Card className="text-center bg-red-100 border-red-300">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium flex items-center justify-center gap-1 text-red-800">
              <DollarSign className="h-3 w-3" />
              Total Deleted Sales
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm font-bold text-red-800">
              {formatCurrency(session.deletedSales)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </>
)}

          <Separator className="my-4 sm:my-6" />

          {/* Orders Section */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
              <ShoppingCart className="h-4 sm:h-5 w-4 sm:w-5" />
              Orders ({session.orders?.length || 0})
            </h3>
            <div className="w-full overflow-hidden">
              <SessionOrdersTable orders={session.orders || []} />
            </div>
          </div>

          <Separator className="my-4 sm:my-6" />

          {/* Expenses Section */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
              <Receipt className="h-4 sm:h-5 w-4 sm:w-5" />
              Expenses ({session.expenses?.length || 0})
            </h3>
            <div className="w-full overflow-hidden">
              <SessionExpensesTable expenses={session.expenses || []} />
            </div>
          </div>

          <Separator className="my-4 sm:my-6" />
          {/* Deleted Orders Section */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 text-red-700">
            <Trash2 className="h-4 sm:h-5 w-4 sm:w-5" />
            Deleted Orders ({session.deletedOrders?.length || 0})
          </h3>
          <SessionDeletedOrdersTable deletedOrders={session.deletedOrders || []} />
        </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SessionDetailDrawer;