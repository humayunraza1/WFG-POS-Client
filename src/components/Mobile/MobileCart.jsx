import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
  X,
  CreditCard,
  Banknote
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CartItem from '../CartItem';
import CheckoutDialog from '../CheckoutDialog';

const MobileCart = ({ 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout, 
  onClearCart, 
  isOpen, 
  onClose,
  isProcessingOrder = false 
}) => {
  const [paymentType, setPaymentType] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * discount) / 100;
  const afterDiscount = subtotal - discountAmount;
  const total = afterDiscount;

  const handleDiscountChange = (e) => {
    const value = Math.min(Math.max(0, parseInt(e.target.value) || 0), 100);
    setDiscount(value);
  };

  const handleInitialCheckout = () => {
    if (cartItems.length === 0) return;

    const orderData = {
      items: cartItems.map(item => ({
        product: item.prodID,  // Product _id
        variant: item.varID,   // Variant _id
        quantity: item.quantity
      })),
      discount,
      paymentType,
      finalPrice: total
    };

    setPendingOrderData(orderData);
    setShowCheckoutDialog(true);
  };

  const handleConfirmOrder = async (finalOrderData) => {
    try {
      await onCheckout(finalOrderData);
      setShowCheckoutDialog(false);
      setPendingOrderData(null);
      onClose(); // Close mobile cart after successful checkout
      // Cart will be cleared in the parent component after successful checkout
    } catch (error) {
      // Error handling is done in parent component
      console.error('Checkout failed:', error);
    }
  };

  const handleCloseCheckoutDialog = () => {
    setShowCheckoutDialog(false);
    setPendingOrderData(null);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:w-96 p-0">
          <SheetHeader className="p-6 pb-4">
            <SheetTitle className="flex items-center justify-between">
              <span>Current Order</span>
              <Badge variant="secondary">{cartItems.length} items</Badge>
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col h-full px-6 pb-6">
            {cartItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mb-6" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">Cart is empty</h3>
                <p className="text-sm text-muted-foreground">Add items to get started</p>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="flex-1 overflow-hidden mb-6">
                  <ScrollArea className="h-full">
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <CartItem
                          key={item._id}
                          item={item}
                          onUpdateQuantity={onUpdateQuantity}
                          onRemove={onRemoveItem}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                
                {/* Order Configuration */}
                <div className="space-y-6">
                  <Separator />

                  {/* Discount Section */}
                  <div className="space-y-3">
                    <Label htmlFor="discount-mobile" className="text-base font-medium">Discount (%)</Label>
                    <Input
                      id="discount-mobile"
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={handleDiscountChange}
                      className="w-full h-11 text-base"
                      placeholder="Enter discount percentage"
                    />
                  </div>
                  
                  {/* Payment Type Section */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Payment Type</Label>
                    <RadioGroup
                      value={paymentType}
                      onValueChange={setPaymentType}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="cash" id="cash-mobile" />
                        <Label htmlFor="cash-mobile" className="flex items-center cursor-pointer">
                          <Banknote className="mr-2 h-4 w-4" />
                          Cash
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="online" id="online-mobile" />
                        <Label htmlFor="online-mobile" className="flex items-center cursor-pointer">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Online
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <Separator />
                  
                  {/* Order Summary */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-base">
                      <span>Subtotal:</span>
                      <span className="font-medium">PKR {subtotal.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-base text-green-600">
                        <span>Discount ({discount}%):</span>
                        <span className="font-medium">- PKR {discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>PKR {total.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button 
                      className="w-full h-12 text-base" 
                      onClick={handleInitialCheckout}
                      disabled={isProcessingOrder}
                      size="lg"
                    >
                      {isProcessingOrder ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Checkout PKR {total.toLocaleString()}
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full h-12 text-base" 
                      onClick={() => {
                        onClearCart();
                        onClose();
                      }}
                      disabled={isProcessingOrder}
                      size="lg"
                    >
                      Clear Cart
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Checkout Dialog */}
      <CheckoutDialog
        isOpen={showCheckoutDialog}
        onClose={handleCloseCheckoutDialog}
        orderData={pendingOrderData}
        onConfirmOrder={handleConfirmOrder}
        isProcessing={isProcessingOrder}
      />
    </>
  );
};

export default MobileCart;