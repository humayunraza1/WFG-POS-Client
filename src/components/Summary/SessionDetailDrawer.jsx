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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount || 0);
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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-6">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-xl flex items-center gap-3">
            Register Session Details
            {session.manager && (
              <Badge 
                style={getManagerBadgeStyle(session.manager)}
                className="font-medium"
              >
                <User className="h-3 w-3 mr-1" />
                {session.manager}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription className="text-base">
            Session from {formatDateTime(session.openedAt)}
            {session.closedAt && ` to ${formatDateTime(session.closedAt)}`}
            <br/> 
            Status:                   <Badge variant={session.isOpen ? 'destructive' : 'default'} className="text-sm">
                    {session.isOpen ? 'Open' : 'Closed'}
                  </Badge>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8 max-w-2xl">
          {/* Session Metrics */}
          <div>
            <SessionMetrics session={session} />
          </div>

          <Separator className="my-6" />
      
          {/* Cash Information - Compact Version */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Cash Information
            </h3>
            <div className="grid grid-cols-2 gap-3 max-w-xl">
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium flex items-center justify-center gap-1">
                    <Wallet className="h-3 w-3" />
                    Starting Cash
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-lg font-bold">
                    {formatCurrency(session.startCash)}
                  </div>
                </CardContent>
              </Card>

              {session.finalCash !== undefined && (
                <Card className="text-center">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium flex items-center justify-center gap-1">
                      <Wallet className="h-3 w-3" />
                      Final Cash
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-lg font-bold">
                      {formatCurrency(session.finalCash)}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Orders Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Orders ({session.orders?.length || 0})
            </h3>
            <SessionOrdersTable orders={session.orders || []} />
          </div>

          <Separator className="my-6" />

          {/* Expenses Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Expenses ({session.expenses?.length || 0})
            </h3>
            <SessionExpensesTable expenses={session.expenses || []} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SessionDetailDrawer;