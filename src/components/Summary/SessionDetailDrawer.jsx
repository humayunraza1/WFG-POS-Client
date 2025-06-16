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
import { DollarSign, ShoppingCart, Receipt, Wallet, User } from 'lucide-react';
import { format } from 'date-fns';
import SessionMetrics from './SessionMetrics';
import SessionOrdersTable from './SessionOrdersTable';
import SessionExpensesTable from './SessionExpensesTable';

const SessionDetailDrawer = ({ session, isOpen, onClose }) => {
  if (!session) return null;
  console.log('Session Detail:', session);
  const formatCurrency = (amount) => {
    return `PKR ${(amount || 0).toLocaleString()}`;
  };

  const discrepancy = (session.expectedBalance - session.finalCash) || 0;
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
      
          {/* Cash Information */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
              <Wallet className="h-4 sm:h-5 w-4 sm:w-5" />
              Cash Information
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center justify-center gap-1">
                    <Wallet className="h-3 w-3" />
                    Starting Cash
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm sm:text-lg lg:text-xl font-bold">
                    {formatCurrency(session.startCash)}
                  </div>
                </CardContent>
              </Card>

              {session.finalCash !== undefined && (
                <Card className="text-center">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium flex items-center justify-center gap-1">
                      <Wallet className="h-3 w-3" />
                      Final Cash
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm sm:text-lg lg:text-xl font-bold">
                      {formatCurrency(session.finalCash)}
                    </div>
                  </CardContent>
                </Card>
              )}

              {session.expectedBalance !== undefined && (
                <Card className="text-center">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium flex items-center justify-center gap-1">
                      <Wallet className="h-3 w-3" />
                      Expected Cash
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm sm:text-lg lg:text-xl font-bold">
                      {formatCurrency(session.expectedBalance)}
                    </div>
                  </CardContent>
                </Card>
              )}

              {session.expectedBalance !== undefined && (
                <Card className="text-center bg-red-600 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium flex items-center justify-center gap-1">
                      <Wallet className="h-3 w-3" />
                      Cash Discrepancy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm sm:text-lg lg:text-xl font-bold">
                      {formatCurrency(session.expectedBalance-session.finalCash)}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

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
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SessionDetailDrawer;