import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, Clock, DollarSign, Hash, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import ReceiptDrawer from '../ReceiptDrawer';

const SessionDeletedOrdersTable = ({ deletedOrders }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const formatCurrency = (amount) => `PKR ${(amount || 0).toLocaleString()}`;
  const formatDateTime = (date) =>
    date ? format(new Date(date), 'h:mm a') : 'N/A';

  const handleViewOrder = (order) => setSelectedOrder(order);
  const handleCloseReceipt = () => setSelectedOrder(null);

  if (!deletedOrders || deletedOrders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No deleted orders found for this session.
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block border border-red-200 rounded-md w-full">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-red-50">
                <TableHead className="w-[120px] text-red-700">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Order ID
                  </div>
                </TableHead>
                <TableHead className="text-red-700">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Reason
                  </div>
                </TableHead>
                <TableHead className="w-[100px] text-red-700">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Type
                  </div>
                </TableHead>
                <TableHead className="w-[100px] text-red-700">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time
                  </div>
                </TableHead>
                <TableHead className="w-[120px] text-right text-red-700">
                  <div className="flex items-center gap-2 justify-end">
                    <DollarSign className="h-4 w-4" />
                    Price
                  </div>
                </TableHead>
                <TableHead className="w-[80px] text-red-700">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deletedOrders.map((order) => (
                <TableRow
                  key={order._id}
                  className="border-t border-red-100 hover:bg-red-50/40"
                >
                  <TableCell className="font-mono text-sm text-red-700">
                    #{order.originalOrderId?.slice(-6).toUpperCase() ||
                      order._id?.slice(-6).toUpperCase()}
                  </TableCell>
                  <TableCell className="text-sm text-gray-800 max-w-[200px] truncate">
                    {order.deleteReason || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {order.paymentType || 'N/A'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {formatDateTime(order.deletedAt)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm text-gray-900">
                    {formatCurrency(order.finalPrice)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                      className="h-8 w-8 p-0 text-red-700 hover:bg-red-50"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {deletedOrders.map((order) => (
          <Card
            key={order._id}
            className="border border-red-200 bg-red-50/40 text-red-800"
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                  <div className="font-mono text-sm font-medium">
                    #{order.originalOrderId?.slice(-6).toUpperCase() ||
                      order._id?.slice(-6).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(order.deletedAt)}
                  </div>
                  <div className="text-xs mt-1">
                    Reason: {order.deleteReason || '—'}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-medium text-sm">
                      {formatCurrency(order.finalPrice)}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewOrder(order)}
                    className="h-8 px-3 text-red-700 border-red-300 hover:bg-red-100"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Receipt Drawer */}
      <ReceiptDrawer order={selectedOrder} onClose={handleCloseReceipt} />
    </>
  );
};

export default SessionDeletedOrdersTable;
