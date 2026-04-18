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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShoppingCart, CreditCard, Banknote, Smartphone } from 'lucide-react';
import CartItem from './CartItem';
import CheckoutDialog from './CheckoutDialog';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { getPaymentTypeLabel, getTaxRate, getTaxAmount, getTaxLabel } from '@/utils/paymentType';

const Cart = ({ 
  isOpen,
  onClose,
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout, 
  onClearCart,
  discount = 0,
  setDiscount
}) => {
    
    const [paymentType, setPaymentType] = useState('cash');
    const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
    const {isLoading:isProcessingOrder} = useSelector((state)=>state.orders)
    const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
    const [pendingOrderData, setPendingOrderData] = useState(null);
    const [serverData,setServerData] = useState([])
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const {businessPrefs} = useSelector((state)=>state.settings)
    const discountAmount = discount;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = getTaxAmount(afterDiscount, paymentType);
    const total = afterDiscount + taxAmount;

    const handleDiscountChange = (e) => {
        const {value} = e.target;
        setDiscount(value);
    };

    const handleInitialCheckout = () => {
        if (cartItems.length === 0) return;
        //console.log('final cart: ', cartItems)
        // Transform cart items to match Order schema
        const transformedItems = cartItems.flatMap(item => {
            if (!item.isDeal) {
                return [{
                    category: item.catID,
                    product: item.prodID,
                    option: item._id,
                    optionName: item.option?.name || '',
                    unitPrice: item.price,
                    quantity: item.quantity,
                    totalPrice: item.price * item.quantity
                }];
            }

            const selectedOptions = item.option?.dealSelections || [];
            const dealTotalPrice = Number(item.price || 0) * Number(item.quantity || 1);
            const dealName = item.name || 'Deal';

            if (selectedOptions.length === 0) {
                return [{
                    category: item.catID,
                    product: item.prodID,
                    option: item._id,
                    optionName: item.option?.name || 'Deal',
                    dealName,
                    dealSelectionLabel: '',
                    unitPrice: item.price,
                    quantity: item.quantity,
                    totalPrice: dealTotalPrice
                }];
            }

            const totalUnitsPerBundle = selectedOptions.reduce(
                (sum, selection) => sum + Number(selection.quantity || 1),
                0
            );
            const totalUnits = Math.max(1, totalUnitsPerBundle * Number(item.quantity || 1));

            if (item.pricingMode === 'dynamic') {
                return selectedOptions.map((selection) => {
                    const lineQuantity = Number(item.quantity || 1) * Number(selection.quantity || 1);
                    const effectiveUnitPrice = Number(selection.effectivePrice || selection.optionPrice || 0);
                    const lineTotalPrice = Number((effectiveUnitPrice * lineQuantity).toFixed(2));

                    return {
                        category: selection.categoryId,
                        product: selection.productId,
                        option: selection.optionId,
                        optionName: selection.optionName,
                        dealName,
                        dealSelectionLabel: selection.optionName,
                        unitPrice: effectiveUnitPrice,
                        quantity: lineQuantity,
                        totalPrice: lineTotalPrice
                    };
                });
            }

            let distributedTotal = 0;
            return selectedOptions.map((selection, index) => {
                const lineQuantity = Number(item.quantity || 1) * Number(selection.quantity || 1);

                let lineTotalPrice;
                if (index === selectedOptions.length - 1) {
                    lineTotalPrice = Number((dealTotalPrice - distributedTotal).toFixed(2));
                } else {
                    lineTotalPrice = Number(((dealTotalPrice * lineQuantity) / totalUnits).toFixed(2));
                    distributedTotal += lineTotalPrice;
                }

                const unitPrice = lineQuantity > 0
                    ? Number((lineTotalPrice / lineQuantity).toFixed(2))
                    : 0;

                return {
                    category: selection.categoryId,
                    product: selection.productId,
                    option: selection.optionId,
                    optionName: selection.optionName,
                    dealName,
                    dealSelectionLabel: selection.optionName,
                    unitPrice,
                    quantity: lineQuantity,
                    totalPrice: lineTotalPrice
                };
            });
        });
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
            actualPrice,
            tax: taxAmount,
            taxRate: getTaxRate(paymentType),
            finalPrice: total,
            amountPaid: 0,
            outstandingPayment: total
        };
        //console.log("Checkout Cart: ", orderData)
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
                                                key={item.cartKey || `${item.prodID}::${item.varID}`}
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
                                    
                                                                        {/* Payment Method Section */}
                                    <div className="space-y-2 sm:space-y-3">
                                                                                <Label className="text-sm sm:text-base font-medium">Select Payment Method</Label>
                                                                                <Button
                                                                                        type="button"
                                                                                        variant="outline"
                                                                                        className="w-full h-12 sm:h-14 justify-between px-4 text-sm sm:text-base"
                                                                                        onClick={() => setShowPaymentMethodDialog(true)}
                                                                                >
                                                                                        <span>{getPaymentTypeLabel(paymentType)}</span>
                                                                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                                                </Button>
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
                                        {taxAmount > 0 && (
                                            <div className="flex justify-between text-sm sm:text-base text-orange-600">
                                                <span>{getTaxLabel(paymentType)}:</span>
                                                <span className="font-medium">+ PKR {taxAmount.toLocaleString()}</span>
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
                                                    Checkout PKR {total.toLocaleString()}{taxAmount > 0 ? ` (incl. tax)` : ''}
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

            <Dialog open={showPaymentMethodDialog} onOpenChange={setShowPaymentMethodDialog}>
                <DialogContent className="max-w-md rounded-2xl p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl">Select Payment Method</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setPaymentType('cash');
                                setShowPaymentMethodDialog(false);
                            }}
                            className="flex min-h-[80px] w-full items-center gap-4 rounded-xl border px-4 py-4 text-left transition-colors hover:bg-muted/50"
                        >
                            <Banknote className="h-6 w-6 shrink-0 text-emerald-600" />
                            <div>
                                <div className="text-base font-semibold sm:text-lg">Cash</div>
                                <div className="text-sm text-muted-foreground">Pay directly at checkout</div>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setPaymentType('online');
                                setShowPaymentMethodDialog(false);
                            }}
                            className="flex min-h-[80px] w-full items-center gap-4 rounded-xl border px-4 py-4 text-left transition-colors hover:bg-muted/50"
                        >
                            <Smartphone className="h-6 w-6 shrink-0 text-blue-600" />
                            <div>
                                <div className="text-base font-semibold sm:text-lg">Mobile Wallets</div>
                                <div className="text-sm text-muted-foreground">Easypaisa / JazzCash / Nayapay</div>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setPaymentType('card');
                                setShowPaymentMethodDialog(false);
                            }}
                            className="flex min-h-[80px] w-full items-center gap-4 rounded-xl border px-4 py-4 text-left transition-colors hover:bg-muted/50"
                        >
                            <CreditCard className="h-6 w-6 shrink-0 text-violet-600" />
                            <div>
                                <div className="text-base font-semibold sm:text-lg">Debit / Credit Cards</div>
                                <div className="text-sm text-muted-foreground">Card payments and tap-to-pay</div>
                            </div>
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Checkout Dialog */}
            <CheckoutDialog
                isOpen={showCheckoutDialog}
                onClose={handleCloseCheckoutDialog}
                orderData={pendingOrderData}
                onConfirmOrder={handleConfirmOrder}
                serverData={serverData}
            />
        </>
    );
};

export default Cart;