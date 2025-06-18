import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShoppingCart, CreditCard, Banknote, X } from 'lucide-react';
import CartItem from './CartItem';
import CheckoutDialog from './CheckoutDialog';
import { useState } from 'react';

const Cart = ({ 
  isOpen,
  onClose,
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout, 
  onClearCart,
  isProcessingOrder = false,
  discount = 0,
  setDiscount
}) => {
    const [paymentType, setPaymentType] = useState('cash');
    const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
    const [pendingOrderData, setPendingOrderData] = useState(null);

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = discount;
    const afterDiscount = subtotal - discountAmount;
    const total = afterDiscount;

    const handleDiscountChange = (e) => {
        const {value} = e.target;
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
            subtotal,
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
                <SheetContent className="w-[400px] sm:w-[500px] flex flex-col p-6">
                    <SheetHeader className="px-2">
                        <SheetTitle className="flex items-center justify-between">
                            <span>Current Order</span>
                            <Badge variant="secondary">{cartItems.length} items</Badge>
                        </SheetTitle>
                        <SheetDescription>
                            Review your order and proceed to checkout
                        </SheetDescription>
                    </SheetHeader>
                    
                    <div className="flex-1 flex flex-col space-y-4 py-4 px-2 min-h-0">
                        {cartItems.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                                <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Cart is empty</h3>
                                <p className="text-muted-foreground">Add items to get started</p>
                            </div>
                        ) : (
                            <>
                                {/* Scrollable Cart Items Only */}
                                <div className="flex-1 overflow-y-auto min-h-0">
                                    <div className="space-y-2">
                                        {cartItems.map((item) => (
                                            <CartItem
                                                key={item._id}
                                                item={item}
                                                onUpdateQuantity={onUpdateQuantity}
                                                onRemove={onRemoveItem}
                                            />
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Fixed Bottom Section */}
                                <div className="flex-shrink-0 space-y-4 pt-4 border-t bg-background">
                                    <Separator />

                                    {/* Discount Section */}
                                    <div className="space-y-2">
                                        <Label htmlFor="discount">Discount (Rs)</Label>
                                        <Input
                                            id="discount"
                                            type="number"
                                            min="0"
                                            max={subtotal}
                                            value={discount}
                                            onChange={handleDiscountChange}
                                            className="w-full"
                                        />
                                        {discount > subtotal && (
                                            <Label htmlFor="error" className='text-red-400 text-sm'>
                                                Max discount cannot exceed order value.
                                            </Label>
                                        )}
                                    </div>
                                    
                                    {/* Payment Type Section */}
                                    <div className="space-y-2">
                                        <Label>Payment Type</Label>
                                        <RadioGroup
                                            value={paymentType}
                                            onValueChange={setPaymentType}
                                            className="flex flex-col space-y-1"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="cash" id="cash" />
                                                <Label htmlFor="cash" className="flex items-center">
                                                    <Banknote className="mr-2 h-4 w-4" />
                                                    Cash
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="online" id="online" />
                                                <Label htmlFor="online" className="flex items-center">
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    Online Transfer
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                    
                                    <Separator />
                                    
                                    {/* Order Summary */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Subtotal:</span>
                                            <span>PKR {subtotal.toLocaleString()}</span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span>Discount ({((discount/subtotal)*100).toFixed(1)}%):</span>
                                                <span>- PKR {discountAmount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <Separator />
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total:</span>
                                            <span>PKR {total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="space-y-2">
                                        <Button 
                                            className="w-full" 
                                            size="lg"
                                            onClick={handleInitialCheckout}
                                            disabled={isProcessingOrder || (discount > subtotal)}
                                        >
                                            {isProcessingOrder ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                                    Checkout PKR {total.toLocaleString()}
                                                </>
                                            )}
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="w-full" 
                                            onClick={onClearCart}
                                            disabled={isProcessingOrder}
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

export default Cart;