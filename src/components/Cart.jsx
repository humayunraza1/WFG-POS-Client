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
import { usePreferences } from '../hooks/usePreferences';

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
    const [serverData,setServerData] = useState([])
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const {businessPrefs} = usePreferences();
    const discountAmount = discount;
    const afterDiscount = subtotal - discountAmount;
    const total = afterDiscount;

    const handleDiscountChange = (e) => {
        const {value} = e.target;
        setDiscount(value);
    };

    const handleInitialCheckout = () => {
        if (cartItems.length === 0) return;
        console.log('final cart: ', cartItems)
        // Transform cart items to match Order schema
        const transformedItems = cartItems.map(item => ({
            category: item.catID,           // Category ObjectId
            product: item.prodID,                // Product ObjectId
            option:item._id,
            optionName: item.option?.name || '', // Option name as string
            unitPrice: item.price,               // Unit price
            quantity: item.quantity,             // Quantity
            totalPrice: item.price * item.quantity // Calculate total price
        }));
        let serverInfo;
        if (businessPrefs?.trackServers){
            serverInfo = cartItems.map(item=>({
                category: item.category,
                product: item.name,
                variant: item.option.name,
                qty: item.quantity
            }))
        }
        
        setServerData(serverInfo)
        // Calculate actual price (subtotal)
        const actualPrice = transformedItems.reduce((sum, item) => sum + item.totalPrice, 0);

        const orderData = {
            items: transformedItems,
            discount: discountAmount,
            paymentType,
            actualPrice,                    // Subtotal before discount
            finalPrice: total,             // Final price after discount
            amountPaid: 0,                 // Will be set in checkout dialog
            outstandingPayment: total      // Will be calculated in checkout dialog
        };
        console.log("Checkout Cart: ", orderData)
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

    // Calculate total items count
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    return (
        <>
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent 
                    side="right" 
                    className="w-full sm:w-[500px] flex flex-col p-4 sm:p-6"
                >
                    <SheetHeader className="px-0 sm:px-2">
                        <SheetTitle className="flex items-center justify-between text-lg sm:text-xl">
                            <span>Current Order</span>
                            <Badge variant="secondary" className="text-sm">
                                {totalItems} {totalItems === 1 ? 'item' : 'items'}
                            </Badge>
                        </SheetTitle>
                        <SheetDescription className="hidden sm:block">
                            Review your order and proceed to checkout
                        </SheetDescription>
                    </SheetHeader>
                    
                    <div className="flex-1 flex flex-col space-y-4 py-4 px-0 sm:px-2 min-h-0">
                        {cartItems.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                                <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4 sm:mb-6" />
                                <h3 className="text-base sm:text-lg font-semibold mb-2">Cart is empty</h3>
                                <p className="text-sm text-muted-foreground">Add items to get started</p>
                            </div>
                        ) : (
                            <>
                                {/* Scrollable Cart Items Only */}
                                <div className="flex-1 overflow-y-auto min-h-0">
                                    <div className="space-y-2 sm:space-y-3">
                                        {cartItems.map((item) => (
                                            <CartItem
                                                key={`${item.prodID}-${item.varID}`}
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
                                    <div className="space-y-2 sm:space-y-3">
                                        <Label htmlFor="discount" className="text-sm sm:text-base font-medium">
                                            Discount (Rs)
                                        </Label>
                                        <Input
                                            id="discount"
                                            type="number"
                                            min="0"
                                            max={subtotal}
                                            value={discount}
                                            onChange={handleDiscountChange}
                                            className="w-full h-10 sm:h-11 text-sm sm:text-base"
                                            placeholder="Enter discount amount"
                                        />
                                        {discount > subtotal && (
                                            <Label htmlFor="error" className='text-red-400 text-xs sm:text-sm'>
                                                Max discount cannot exceed order value.
                                            </Label>
                                        )}
                                    </div>
                                    
                                    {/* Payment Type Section */}
                                    <div className="space-y-2 sm:space-y-3">
                                        <Label className="text-sm sm:text-base font-medium">Payment Type</Label>
     <RadioGroup
  value={paymentType}
  onValueChange={setPaymentType}
  className="grid grid-cols-2 gap-3 sm:gap-4"
>
  <label
    htmlFor="cash"
    className="flex items-center space-x-2 border rounded-lg p-2 sm:p-3 hover:bg-muted/50 transition-colors cursor-pointer"
  >
    <RadioGroupItem value="cash" id="cash" />
    <Banknote className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
    <span className="text-sm sm:text-base">Cash</span>
  </label>

  <label
    htmlFor="online"
    className="flex items-center space-x-2 border rounded-lg p-2 sm:p-3 hover:bg-muted/50 transition-colors cursor-pointer"
  >
    <RadioGroupItem value="online" id="online" />
    <CreditCard className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
    <span className="text-sm sm:text-base">Online</span>
  </label>
</RadioGroup>
                                    </div>
                                    
                                    <Separator />
                                    
                                    {/* Order Summary */}
                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="flex justify-between text-sm sm:text-base">
                                            <span>Subtotal:</span>
                                            <span className="font-medium">PKR {subtotal.toLocaleString()}</span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex justify-between text-sm sm:text-base text-green-600">
                                                <span>Discount ({((discount/subtotal)*100).toFixed(1)}%):</span>
                                                <span className="font-medium">- PKR {discountAmount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <Separator />
                                        <div className="flex justify-between font-bold text-base sm:text-lg">
                                            <span>Total:</span>
                                            <span>PKR {total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="space-y-2 sm:space-y-3">
                                        <Button 
                                            className="w-full h-11 sm:h-12 text-sm sm:text-base" 
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
                                                    <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                                    Checkout PKR {total.toLocaleString()}
                                                </>
                                            )}
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="w-full h-11 sm:h-12 text-sm sm:text-base" 
                                            onClick={onClearCart}
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
                serverData={serverData}
            />
        </>
    );
};

export default Cart;