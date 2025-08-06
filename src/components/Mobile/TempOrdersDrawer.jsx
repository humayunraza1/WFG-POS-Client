import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardList, 
  X, 
  Clock,
  Package,
  Trash2,
  ShoppingCart
} from 'lucide-react';
import {useTempOrders} from '../../hooks/useTempOrders';
import { getManagerBadgeStyle } from '../../utils/managerColors';

const TempOrdersDrawer = ({isOpen, setIsOpen }) => {
  // const [isOpen, setIsOpen] = useState(false);
 const {loadTempOrders,removeOrder,clearAllOrders,tempOrders} = useTempOrders()
  // Load temp orders from localStorage on component mount
  useEffect(() => {
    loadTempOrders();
    //console.log(tempOrders)
  }, []);

  return (
    <>
      {/* Floating Action Button - positioned on right side */}
      {/* <div className="z-40 lg:hidden"> */}
        {/* <div className="relative"> */}
          {/* Badge for order count */}
          {/* {tempOrders?.length > 0 && ( */}
            {/* <Badge  */}
              {/* variant="destructive"  */}
              {/* className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs z-10" */}
            {/* > */}
              {/* {tempOrders.length} */}
            {/* </Badge> */}
          {/* )} */}
          {/* <Button */}
            {/* onClick={() => setIsOpen(true)} */}
            {/* size="lg" */}
            {/* className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 bg-orange-500 hover:bg-orange-600" */}
            {/* aria-label="View Temp Orders" */}
          {/* > */}
            {/* <ClipboardList className="h-6 w-6" /> */}
          {/* </Button> */}
        {/* </div> */}
      {/* </div> */}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-background border-t shadow-2xl z-50 transform transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '75vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/50">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Temp Orders</h3>
            {tempOrders?.length > 0 && (
              <Badge variant="secondary">{tempOrders.length}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {tempOrders?.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllOrders}
                className="h-8 px-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Orders List with proper scrolling */}
        <div className="flex-1 overflow-hidden" style={{ height: 'calc(75vh - 80px)' }}>
          <ScrollArea className="h-full">
            <div className="p-4">
              {tempOrders?.length > 0 ? (
                <div className="space-y-3">
                  {tempOrders?.map((order, index) => (
                    <Card key={order.id} className="border border-border/50">
                      <CardContent className="p-4">
                        {/* Order Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                              <div  className="inline-block px-1.5 py-0.5 rounded text-xs font-semibold" style={getManagerBadgeStyle(order.serverName)} >
                              {order.serverName}
                              </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {order.time}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOrder(index)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2">
                          {order.items.map((item, itemIndex) => (
                            <div 
                              key={itemIndex} 
                              className="flex items-center gap-2 text-sm bg-muted/30 rounded-lg p-2"
                            >
                              <Package className="h-4 w-4 text-primary flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">
                                  {item.qty}x {item.product} 
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {item.category} • {item.variant}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ClipboardList className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h4 className="font-medium mb-2">No temp orders yet</h4>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Orders placed will appear here temporarily until they're delivered to customers.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
};

export default TempOrdersDrawer;