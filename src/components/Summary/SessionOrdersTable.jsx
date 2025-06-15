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
import { Eye, Clock, DollarSign, Hash } from 'lucide-react';
import { format } from 'date-fns';
import ReceiptDrawer from '../ReceiptDrawer';

const SessionOrdersTable = ({ orders }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const formatCurrency = (amount) => {
    return `PKR ${(amount || 0).toLocaleString()}`;
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'h:mm a');
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseReceipt = () => {
    setSelectedOrder(null);
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No orders found for this session.
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block border rounded-md w-full">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Order ID
                  </div>
                </TableHead>
                <TableHead className="w-[100px]">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time
                  </div>
                </TableHead>
                <TableHead className="w-[120px] text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <DollarSign className="h-4 w-4" />
                    Price
                  </div>
                </TableHead>
                <TableHead className="w-[80px]">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-mono text-sm">
                    #{order._id?.slice(-6) || 'N/A'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDateTime(order.dateOrdered || order.createdAt)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">
                    {formatCurrency(order.finalPrice)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                      className="h-8 w-8 p-0"
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
        {orders.map((order) => (
          <Card key={order._id} className="border">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                  <div className="font-mono text-sm font-medium">
                    #{order._id?.slice(-6) || 'N/A'}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(order.dateOrdered || order.createdAt)}
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
                    className="h-8 px-3"
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
      <ReceiptDrawer 
        order={selectedOrder} 
        onClose={handleCloseReceipt} 
      />
    </>
  );
};

export default SessionOrdersTable;