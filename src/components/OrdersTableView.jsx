import { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Eye, RefreshCw, Filter, Search } from 'lucide-react';
import { format } from 'date-fns';
import ReceiptDrawer from './ReceiptDrawer';

const ORDERS_PER_PAGE = 10;

const OrdersTableView = ({ orders, onDelete, onRefresh, isLoading, onUpdatePayment }) => {
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [searchId, setSearchId] = useState('');

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    
    // Filter by payment status
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === paymentFilter);
    }
    
    // Filter by search ID
    if (searchId.trim() !== '') {
      filtered = filtered.filter(order => 
        order._id.toLowerCase().includes(searchId.toLowerCase()) ||
        order._id.slice(-6).toLowerCase().includes(searchId.toLowerCase())
      );
    }
    
    return filtered;
  }, [orders, paymentFilter, searchId]);

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

  const handleSearchChange = (e) => {
    setSearchId(e.target.value);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchId('');
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
      <CardHeader className="space-y-4">
        {/* Title and Refresh Button Row */}
        <div className="flex items-center justify-between">
          <CardTitle>Orders</CardTitle>
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
        
        {/* Search and Filter Row */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Payment Status Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Select value={paymentFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filter by payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by Order ID"
                value={searchId}
                onChange={handleSearchChange}
                className="pl-10 w-full"
              />
            </div>
            {searchId && (
              <Button onClick={clearSearch} variant="outline" size="sm" className="flex-shrink-0">
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">
            Loading orders...
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            {searchId ? 'No orders found matching your search.' : 
             paymentFilter === 'all' 
               ? 'No orders placed today.' 
               : `No ${paymentFilter} orders found.`
            }
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <ScrollArea className="h-[calc(100vh-400px)] w-full">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead className="w-[120px]">Items</TableHead>
                        <TableHead className="w-[120px]">Total</TableHead>
                        <TableHead className="w-[130px]">Payment Status</TableHead>
                        <TableHead className="w-[120px]">Outstanding</TableHead>
                        <TableHead className="w-[180px]">Time</TableHead>
                        <TableHead className="w-[80px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedOrders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell className="font-mono text-sm">
                            {order._id.slice(-6).toUpperCase()}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setSelectedOrder(order)}
                              className="h-8 px-2"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">
                            PKR {order.finalPrice.toLocaleString()}
                          </TableCell>
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
                          <TableCell className="text-sm">
                            {format(new Date(order.createdAt), 'MMM dd, h:mm a')}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => onDelete(order._id)}
                              className="h-8 w-8"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              <ScrollArea className="h-[calc(100vh-400px)] w-full">
                <div className="space-y-4 p-4">
                  {paginatedOrders.map((order) => (
                    <Card key={order._id} className="border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col">
                            <div className="font-mono text-sm font-medium">
                              ID: {order._id.slice(-6).toUpperCase()}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {format(new Date(order.createdAt), 'MMM dd, h:mm a')}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getPaymentStatusBadge(order.paymentStatus, order.outstandingPayment)}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => onDelete(order._id)}
                              className="h-8 w-8"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm mb-3">
                          <div className="flex justify-between">
                            <span>Total:</span>
                            <span className="font-medium">PKR {order.finalPrice.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Outstanding:</span>
                            <span className={order.outstandingPayment > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                              {order.outstandingPayment > 0 ? `PKR ${order.outstandingPayment.toLocaleString()}` : '-'}
                            </span>
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedOrder(order)}
                          className="w-full"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Items
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && sortedOrders.length > 0 && (
          <div className="p-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                <PaginationItem className="text-sm px-2">
                  Page {page} of {totalPages}
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
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