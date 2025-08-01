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
import { Package, Clock } from 'lucide-react';

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
  return id.slice(-5);
};

const EmployeeDetailsDrawer = ({ employee, isOpen, onClose }) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {employee?.employeeName} - Delivery Details
          </SheetTitle>
          <SheetDescription>
            Total Deliveries: {employee?.totalDeliveries || 0}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          <Accordion type="single" collapsible className="w-full">
            {employee?.sessions?.map((session, sessionIndex) => (
              <AccordionItem key={session.sessionId} value={`session-${sessionIndex}`}>
                <AccordionTrigger className="text-left">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">
                      Session: ...{getLastFiveDigits(session.sessionId)}
                    </span>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Started: {formatDateTime(session.openedAt)}
                      </span>
                    </div>
                    {session.closedAt && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Ended: {formatDateTime(session.closedAt)}
                      </div>
                    )}
                    {!session.closedAt && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mt-1">
                        Active Session
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Deliveries in this session: {session.deliveries}
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Orders:</h4>
                      {session.orders?.length > 0 ? (
                        session.orders.map((order, orderIndex) => (
                          <div key={order.orderId} className="bg-muted/50 p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-sm">
                                Order: ...{getLastFiveDigits(order.orderId)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(order.createdAt)}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground italic">
                          No orders found for this session
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
            
            {(!employee?.sessions || employee.sessions.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No session data available for this employee
              </div>
            )}
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EmployeeDetailsDrawer;