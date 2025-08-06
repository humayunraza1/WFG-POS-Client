import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Package, Clock, DollarSign, Percent, Calendar } from 'lucide-react';

// Utility functions
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const getLastFiveDigits = (id) => {
  if (!id) return 'N/A';
  return id.slice(-6);
};

const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return 'Rs. 0';
  return `Rs. ${amount.toLocaleString()}`;
};

const calculateServerPayout = (totalValue) => {
  return Math.round(totalValue * 40); // 40% of total order value
};

const EmployeeDetailsDrawer = ({ employee, isOpen, onClose }) => {
  if (!employee) return null;

  const serverPayout = calculateServerPayout(employee.orderCount);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <span className="text-blue-600 font-semibold">
                {employee.serverName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-lg font-semibold">{employee.serverName}</div>
              <div className="text-sm font-normal text-muted-foreground">Order Details</div>
            </div>
          </SheetTitle>
          <SheetDescription className="mt-3 px-1">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-green-600" />
                <span className="font-medium">Total Orders:</span>
                <span className="font-bold text-foreground">{employee.orderCount || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Total Value:</span>
                <span className="font-bold text-foreground">{formatCurrency(employee.totalValue)}</span>
              </div>
            </div>
            <div className="mt-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 text-sm">
                <Percent className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-800">Server Payout:</span>
                <span className="font-bold text-orange-900">{formatCurrency(serverPayout)}</span>
              </div>
            </div>
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {(!employee.orders || employee.orders.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                No orders are available for this server at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Orders ({employee.orders.length})
                  </span>
                </div>
                <div className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                  Current Session
                </div>
              </div>
              
              <div className="space-y-3">
                {employee.orders.map((order, index) => (
                  <div 
                    key={order.id} 
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span className="font-mono text-sm font-medium text-gray-900">
                          Order ...{getLastFiveDigits(order.id)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                        #{index + 1}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Ordered:</span>
                        </div>
                        <span className="text-sm font-medium">
                          {formatDateTime(order.dateOrdered)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <DollarSign className="h-3 w-3 text-purple-600" />
                          <span>Order Value:</span>
                        </div>
                        <span className="font-bold text-purple-700">
                          {formatCurrency(order.finalPrice)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between bg-orange-50 p-2 rounded border border-orange-100">
                        <div className="flex items-center gap-1 text-sm font-medium text-orange-800">
                          <Percent className="h-3 w-3" />
                          <span>Server Earning :</span>
                        </div>
                        <span className="font-bold text-orange-900">
                          Rs. 40
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Summary at bottom */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Session Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Orders:</span>
                    <span className="font-medium">{employee.orderCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Order Value:</span>
                    <span className="font-medium">{formatCurrency(employee.totalValue)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-300">
                    <span className="text-orange-700">Total Server Payout:</span>
                    <span className="text-orange-900">{formatCurrency(serverPayout)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EmployeeDetailsDrawer;