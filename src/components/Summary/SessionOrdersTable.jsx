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
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import ReceiptDrawer from '../ReceiptDrawer';

const SessionOrdersTable = ({ orders }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount || 0);
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'h:mm:ss a');
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
      <div className="border rounded-md max-w-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Order ID</TableHead>
              <TableHead className="w-[100px]">Time</TableHead>
              <TableHead className="w-[120px] text-right">Price</TableHead>
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