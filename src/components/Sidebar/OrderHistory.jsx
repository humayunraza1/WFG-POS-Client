import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, Eye, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import ReceiptDrawer from '../ReceiptDrawer';
import { useGetAllOrdersQuery } from '../../features/orders/ordersAPI';

const OrdersHistory = ({ onUpdatePayment }) => {
  const {data:allOrders,isLoading: isLoadingAllOrders,refetch:fetchAllOrders } = useGetAllOrdersQuery()
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [error, setError] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Pagination state - responsive orders per page
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile screen
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const ordersPerPage = isMobile ? 5 : 10;
  
  useEffect(() => {
    // Set initial filtered orders when allOrders is loaded
    setFilteredOrders(allOrders);
  }, [allOrders]);

  useEffect(() => {
    // Filter orders based on search ID
    if (searchId.trim() === '') {
      setFilteredOrders(allOrders);
    } else {
      const filtered = allOrders.filter(order => 
        order._id.toLowerCase().includes(searchId.toLowerCase()) ||
        order._id.slice(-6).toLowerCase().includes(searchId.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [searchId, allOrders]);

  const handleRefreshOrders = async () => {
    try {
      await fetchAllOrders();
    } catch (err) {
      setError(err.message || 'Failed to refresh orders');
    }
  };

  const handleUpdatePayment = async (orderId, amount) => {
    try {
      const result = await onUpdatePayment(orderId, amount);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseDrawer = () => {
    setSelectedOrder(null);
  };

  const getPaymentStatusBadge = (order) => {
    const hasOutstanding = (order.outstandingPayment || 0) > 0;
    if (hasOutstanding) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
          Pending
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Paid
        </Badge>
      );
    }
  };

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders?.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders?.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearchChange = (e) => {
    setSearchId(e.target.value);
  };

  const clearSearch = () => {
    setSearchId('');
  };

  if (isLoadingAllOrders) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading orders history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={handleRefreshOrders}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Orders History</h2>
          <p className="text-muted-foreground">
            View all orders placed across all register sessions
          </p>
        </div>
        <Button onClick={handleRefreshOrders} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>All Orders</CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="searchId"
                  type="text"
                  placeholder="Search by ID"
                  value={searchId}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
              {searchId && (
                <Button onClick={clearSearch} variant="outline" size="sm">
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredOrders?.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                {searchId ? 'No orders found matching your search.' : 'No orders found.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-background border-b">
                      <tr>
                        <th className="text-left p-3 font-medium w-[100px]">Order ID</th>
                        <th className="text-left p-3 font-medium w-[140px]">Date Placed</th>
                        <th className="text-left p-3 font-medium w-[120px]">Payment Status</th>
                        <th className="text-right p-3 font-medium w-[120px]">Total Amount</th>
                        <th className="text-right p-3 font-medium w-[120px]">Amount Paid</th>
                        <th className="text-right p-3 font-medium w-[120px]">Outstanding</th>
                        <th className="text-center p-3 font-medium w-[100px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentOrders?.map((order) => {
                        const orderDate = order.createdAt || order.dateOrdered;
                        return (
                          <tr key={order._id} className="border-b hover:bg-muted/50">
                            <td className="p-3">
                              <div className="font-mono text-sm font-medium">
                                {order._id.slice(-6).toUpperCase()}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {orderDate ? format(new Date(orderDate), 'MMM dd, yyyy') : 'N/A'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {orderDate ? format(new Date(orderDate), 'h:mm a') : ''}
                                </span>
                              </div>
                            </td>
                            <td className="p-3">
                              {getPaymentStatusBadge(order)}
                            </td>
                            <td className="p-3 text-right font-medium">
                              PKR {(order.finalPrice || 0).toLocaleString()}
                            </td>
                            <td className="p-3 text-right text-green-600 font-medium">
                              PKR {(order.amountPaid || 0).toLocaleString()}
                            </td>
                            <td className="p-3 text-right">
                              <span className={(order.outstandingPayment || 0) > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                                PKR {(order.outstandingPayment || 0).toLocaleString()}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <Button
                                onClick={() => handleViewOrder(order)}
                                size="sm"
                                variant="outline"
                                className="h-8 px-3"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards - No ScrollArea, just pagination */}
              <div className="lg:hidden">
                <div className="space-y-3 p-4">
                  {currentOrders?.map((order) => {
                    const orderDate = order.createdAt || order.dateOrdered;
                    return (
                      <Card key={order._id} className="border">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-mono text-sm font-medium">
                                ID: {order._id.slice(-6).toUpperCase()}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3" />
                                {orderDate ? format(new Date(orderDate), 'MMM dd, yyyy h:mm a') : 'N/A'}
                              </div>
                            </div>
                            {getPaymentStatusBadge(order)}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                            <div className="space-y-1">
                              <div className="text-muted-foreground">Total Amount</div>
                              <div className="font-medium">PKR {(order.finalPrice || 0).toLocaleString()}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-muted-foreground">Amount Paid</div>
                              <div className="text-green-600 font-medium">PKR {(order.amountPaid || 0).toLocaleString()}</div>
                            </div>
                            <div className="space-y-1 col-span-2">
                              <div className="text-muted-foreground">Outstanding</div>
                              <div className={(order.outstandingPayment || 0) > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                                PKR {(order.outstandingPayment || 0).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => handleViewOrder(order)}
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Items & Details
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t bg-background gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders?.length)} of {filteredOrders?.length} orders
                {isMobile && <span className="block text-xs mt-1">({ordersPerPage} per page on mobile)</span>}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt Drawer */}
      <ReceiptDrawer
        order={selectedOrder}
        onClose={handleCloseDrawer}
        onUpdatePayment={handleUpdatePayment}
      />
    </div>
  );
};

export default OrdersHistory;