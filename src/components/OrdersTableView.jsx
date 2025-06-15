import { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Eye, RefreshCw, Filter } from 'lucide-react';
import { format } from 'date-fns';
import ReceiptDrawer from './ReceiptDrawer';

const ORDERS_PER_PAGE = 10;

const OrdersTableView = ({ orders, onDelete, onRefresh, isLoading, onUpdatePayment }) => {
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState('all');

  const filteredOrders = useMemo(() => {
    if (paymentFilter === 'all') return orders;
    return orders.filter(order => order.paymentStatus === paymentFilter);
  }, [orders, paymentFilter]);

  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [filteredOrders]);

  const totalPages = Math.ceil(sortedOrders.length / ORDERS_PER_PAGE);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * ORDERS_PER_PAGE;
    return sortedOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [sortedOrders, page]);

  // Reset page when filter changes
  const handleFilterChange = (value) => {
    setPaymentFilter(value);
    setPage(1);
  };

  const getPaymentStatusBadge = (status, outstandingPayment) => {
    if (status === 'paid') {
      return <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
    } else {
      return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Pending</Badge>;
    }
  };

  return (
    <Card className="h-full max-h-[calc(100vh-200px)] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Orders</CardTitle>
        <div className="flex items-center gap-2">
          {/* Payment Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={paymentFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter by payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[60vh]">
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">
              Loading orders...
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {paymentFilter === 'all' 
                ? 'No orders placed today.' 
                : `No ${paymentFilter} orders found.`
              }
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order._id.slice(-6).toUpperCase()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                    <TableCell>PKR {order.finalPrice.toLocaleString()}</TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(order.paymentStatus, order.outstandingPayment)}
                    </TableCell>
                    <TableCell>
                      {order.outstandingPayment > 0 ? (
                        <span className="text-red-600 font-medium">
                          PKR {order.outstandingPayment.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-green-600">-</span>
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(order.createdAt), 'PPpp')}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(order._id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && sortedOrders.length > 0 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setPage(p => Math.max(p - 1, 1))} />
              </PaginationItem>
              <PaginationItem className="text-sm px-2">Page {page} of {totalPages}</PaginationItem>
              <PaginationItem>
                <PaginationNext onClick={() => setPage(p => Math.min(p + 1, totalPages))} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>

      <ReceiptDrawer 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)}
        onUpdatePayment={onUpdatePayment}
      />
    </Card>
  );
};

export default OrdersTableView;