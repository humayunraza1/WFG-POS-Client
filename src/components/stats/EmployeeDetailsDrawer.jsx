import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Package, Clock, Calendar } from 'lucide-react';

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

const EmployeeDetailsDrawer = ({ employee, isOpen, onClose }) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-semibold">{employee?.employeeName}</div>
              <div className="text-sm font-normal text-muted-foreground">Delivery Details</div>
            </div>
          </SheetTitle>
          <SheetDescription className="mt-3 px-1">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                <span className="font-medium">Total Deliveries:</span>
                <span className="font-bold text-foreground">{employee?.totalDeliveries || 0}</span>
              </div>
            </div>
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {(!employee?.sessions || employee.sessions.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Session Data</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                No session data is available for this employee at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Sessions ({employee.sessions.length})
                </span>
              </div>
              
              <Accordion type="single" collapsible className="w-full space-y-3">
                {employee.sessions.map((session, sessionIndex) => (
                  <AccordionItem 
                    key={session.sessionId} 
                    value={`session-${sessionIndex}`}
                    className="border border-gray-200 rounded-lg shadow-sm bg-white"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 rounded-lg data-[state=open]:rounded-b-none transition-colors">
                      <div className="flex flex-col items-start w-full">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-semibold text-sm">
                            Session: ...{getLastFiveDigits(session.sessionId)}
                          </span>
                          {!session.closedAt && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                              Active
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-1 mt-2 w-full">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Started: {formatDateTime(session.openedAt)}</span>
                          </div>
                          {session.closedAt && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>Ended: {formatDateTime(session.closedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="px-4 pb-4 bg-gray-50/50">
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <Package className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            Deliveries in this session: {session.deliveries}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            Orders ({session.orders?.length || 0})
                          </h4>
                          
                          {session.orders?.length > 0 ? (
                            <div className="space-y-2">
                              {session.orders.map((order, orderIndex) => (
                                <div key={order.orderId} className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                      <span className="font-mono text-sm font-medium">
                                        ...{getLastFiveDigits(order.orderId)}
                                      </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                                      {formatDateTime(order.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-muted-foreground bg-white border border-dashed border-gray-300 rounded-lg">
                              <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm italic">No orders found for this session</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EmployeeDetailsDrawer;