import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import ReceiptDrawer from './ReceiptDrawer';

const SummaryTable = ({ data, period }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  if (!data?.recentOrders || data.recentOrders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No orders found for the selected period
      </div>
    );
  }

  const getPaymentTypeColor = (type) => {
    return type === 'cash' ? 'default' : 'secondary';
  };

  const handleViewOrder = (orderId) => {
    const order = data.recentOrders.find(order => order._id === orderId);
    if (order) {
      // Add createdAt field if it doesn't exist, using dateOrdered as fallback
      const orderWithCreatedAt = {
        ...order,
        createdAt: order.createdAt || order.dateOrdered
      };
      setSelectedOrder(orderWithCreatedAt);
    }
  };

  const handleCloseDrawer = () => {
    setSelectedOrder(null);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
          <Badge variant="outline">
            {data.recentOrders.length} orders
          </Badge>
        </div>
        
        <ScrollArea className="h-96 border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">
                    #{order._id.slice(-6)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {format(new Date(order.dateOrdered), 'MMM d, yyyy')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(order.dateOrdered), 'h:mm a')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {order.items.length} items
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Qty: {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPaymentTypeColor(order.paymentType)}>
                      {order.paymentType.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    PKR {order.finalPrice.toLocaleString()}
                    {order.discount > 0 && (
                      <div className="text-xs text-muted-foreground">
                        (-PKR {order.discount})
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewOrder(order._id)}
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

      {/* Receipt Drawer */}
      <ReceiptDrawer 
        order={selectedOrder} 
        onClose={handleCloseDrawer} 
      />
    </>
  );
};

export default SummaryTable;