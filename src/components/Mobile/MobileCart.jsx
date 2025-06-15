import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronDown, 
  ChevronRight, 
  DollarSign, 
  ShoppingCart, 
  Calculator,
  Package2,
  BarChart3,
  Receipt,
  Plus,
  Edit3,
  Power,
  Minus,
  Trash2,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CartItem from '../CartItem';

const MobileCart = ({ cartItems, onUpdateQuantity, onRemoveItem, onCheckout, onClearCart, isOpen, onClose }) => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + tax;
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="fixed right-0 top-0 h-full w-80 bg-background border-l">
          <Card className="h-full rounded-none border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span>Current Order</span>
                <Badge variant="secondary">{cartItems.length} items</Badge>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 h-full pb-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Cart is empty</p>
                  <p className="text-sm text-muted-foreground">Add items to get started</p>
                </div>
              ) : (
                <>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {cartItems.map((item) => (
                        <CartItem
                          key={item.id}
                          item={item}
                          onUpdateQuantity={onUpdateQuantity}
                          onRemove={onRemoveItem}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>PKR {subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (8%):</span>
                      <span>PKR {tax}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>PKR {total}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button className="w-full" onClick={() => {
                      onCheckout(total);
                      onClose();
                    }}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Checkout PKR {total}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={onClearCart}
                    >
                      Clear Cart
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  export default MobileCart;