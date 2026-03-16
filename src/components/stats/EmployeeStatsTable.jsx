import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefreshCw, Package, Eye, DollarSign, Percent } from 'lucide-react';
import EmployeeDetailsDrawer from './EmployeeDetailsDrawer';
import { useGetEmployeeStatsQuery } from '../../features/stats/statsAPI';
import { useSelector } from 'react-redux';

// Utility functions
const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return 'Rs. 0';
  return `Rs. ${amount.toLocaleString()}`;
};

const calculateServerPayout = (totalValue) => {
  return Math.round(totalValue * 40); // 40% of total order value
};

const EmployeeStatsTable = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isOpen: isRegisterOpen } = useSelector((state) => state.register);
  
  const { data, isSuccess, isLoading: loading, refetch, isFetching } = useGetEmployeeStatsQuery(undefined, {
    skip: !isRegisterOpen,
    refetchOnMountOrArgChange: true,
  });

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setDrawerOpen(true);
  };

  const handleRefresh = () => {
    if (!isRegisterOpen) return;
    refetch();
  };

  if (!isRegisterOpen) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Open a register session to view employee statistics
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
        Loading employee statistics...
      </div>
    );
  }

  if (!isSuccess) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load statistics data
      </div>
    );
  }

  // Calculate totals for summary
  // const totalOrders = data?.data?.reduce((sum, emp) => sum + emp.orderCount, 0) || 0;
  // const totalValue = data?.data?.reduce((sum, emp) => sum + emp.totalValue, 0) || 0;
  // const totalPayout = data?.data?.reduce((sum, emp) => sum + calculateServerPayout(emp.orderCount), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Server Statistics
          </h2>
          <div className="text-sm text-muted-foreground">
            Current active session statistics
          </div>
        </div>
        
        {/* Refresh Button */}
        <Button 
          onClick={handleRefresh} 
          disabled={isFetching}
          variant="outline"
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Server Name</TableHead>
              <TableHead className="w-[120px] text-center">Total Orders</TableHead>
              <TableHead className="w-[150px] text-right">Total Value</TableHead>
              <TableHead className="w-[150px] text-right">Server Payout</TableHead>
              <TableHead className="w-[100px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.length > 0 ? (
              data.data.map((server) => {
                const serverPayout = calculateServerPayout(server.orderCount);
                
                return (
                  <TableRow key={server.serverId || 'unassigned'}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-blue-600">
                            {server.serverName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {server.serverName}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        <Package className="h-3 w-3" />
                        {server.orderCount}
                      </span>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <span className="font-semibold text-purple-700">
                        {formatCurrency(server.totalValue)}
                      </span>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(serverPayout)}
                      </span>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(server)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Package className="h-8 w-8" />
                    <div className="text-lg font-medium">No server data available</div>
                    <div className="text-sm">No orders found for the current active session</div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-4">
        {data?.data?.length > 0 ? (
          data.data.map((server) => {
            const serverPayout = calculateServerPayout(server.orderCount);
            
            return (
              <div 
                key={server.serverId || 'unassigned'} 
                className="bg-card border rounded-lg p-4 space-y-4"
              >
                {/* Server Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {server.serverName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-base">{server.serverName}</div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(server)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    View
                  </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Total Orders */}
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium text-green-700 uppercase tracking-wide">
                        Total Orders
                      </span>
                    </div>
                    <div className="text-lg font-bold text-green-800">
                      {server.orderCount}
                    </div>
                  </div>

                  {/* Total Value */}
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">
                        Total Value
                      </span>
                    </div>
                    <div className="text-lg font-bold text-purple-800">
                      {formatCurrency(server.totalValue)}
                    </div>
                  </div>

                  {/* Server Payout */}
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Percent className="h-4 w-4 text-orange-600" />
                      <span className="text-xs font-medium text-orange-700 uppercase tracking-wide">
                        Server Payout
                      </span>
                    </div>
                    <div className="text-lg font-bold text-orange-800">
                      {formatCurrency(serverPayout)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-card border rounded-lg p-12 text-center">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <Package className="h-12 w-12" />
              <div className="space-y-2">
                <div className="text-lg font-medium">No server data available</div>
                <div className="text-sm">No orders found for the current active session</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Employee Details Drawer */}
      <EmployeeDetailsDrawer
        employee={selectedEmployee}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};

export default EmployeeStatsTable;