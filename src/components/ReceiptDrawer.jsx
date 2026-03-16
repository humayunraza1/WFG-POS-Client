import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import receiptPrinter from '@/services/receiptPrinter';
import { DollarSign, AlertCircle } from 'lucide-react';
import { getManagerBadgeStyle } from '../utils/managerColors';
import { getPaymentTypeLabel } from '@/utils/paymentType';

const ReceiptDrawer = ({ order, onClose, onUpdatePayment }) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [error, setError] = useState('');

  if (!order) return null;
  //console.log('ReceiptDrawer order:', order);
  
  // Use dateOrdered if createdAt doesn't exist
  const orderDate = order.createdAt || order.dateOrdered;
  const formattedDate = orderDate ? format(new Date(orderDate), 'PPP') : 'N/A';
  const formattedTime = orderDate ? format(new Date(orderDate), 'h:mm:ss a') : 'N/A';

  const discountRate = order.discount || 0;
  const discountedTotal = order.finalPrice;
  const totalAmount = order.actualPrice || 0;

  
  const handlePaymentUpdate = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(paymentAmount);

    setIsUpdatingPayment(true);
    setError('');

    try {
      await onUpdatePayment(order._id, amount);
      setPaymentAmount('');
      setShowPaymentForm(false);
      onClose(); // Close the drawer after updating payment
      // Note: The order will be updated in the parent component
    } catch (err) {
      setError(err.message || 'Failed to update payment');
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const handlePaymentAmountChange = (value) => {
    setPaymentAmount(value);
    setError('');
  };

  const getPaymentStatusBadge = () => {
    if (order.paymentStatus === 'paid' || (order.outstandingPayment || 0) <= 0) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
    } else {
      return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Pending</Badge>;
    }
  };

  return (
    <Sheet open={!!order} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-md p-0 flex flex-col h-full animate-slide-in-from-right"
      >
        {/* Fixed Header - Properly constrained */}
        <div className="flex-shrink-0 p-4 pb-3 border-b bg-white z-10">
          <SheetHeader>
            <SheetTitle className="text-center text-lg font-bold">The Cartel Burgers</SheetTitle>
          </SheetHeader>

          <div className="text-xs text-muted-foreground space-y-1 mt-3">
            <div className="font-semibold text-sm">Order Summary</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="col-span-2 flex items-center gap-2">
                <span>Manager:</span>
                <div 
                  className="inline-block px-1.5 py-0.5 rounded text-xs font-semibold"
                  style={getManagerBadgeStyle(order.registerSession?.manager)}
                >
                  {order.registerSession?.manager || 'N/A'}
                </div>
              </div>
              <div>Order ID: <span className="font-medium">{order._id.slice(-6).toUpperCase()}</span></div>
              <div>Type: <span>{getPaymentTypeLabel(order.paymentType)}</span></div>
              <div className="col-span-2">Date: {formattedDate} • {formattedTime}</div>
              <div className="col-span-2 flex items-center gap-2">
                Status: {getPaymentStatusBadge()}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content - Native scrolling */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="px-4 py-4 space-y-4">
            {/* Payment Information Card */}
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-semibold">PKR {(order.finalPrice || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Paid:</span>
                    <span className="text-green-600 font-semibold">PKR {(order.amountPaid || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Outstanding Payment:</span>
                    <span className={`font-bold ${(order.outstandingPayment || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      PKR {(order.outstandingPayment || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Update Section */}
            {(order.outstandingPayment || 0) > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  {!showPaymentForm ? (
                    <Button 
                      onClick={() => setShowPaymentForm(true)}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      size="sm"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Update Payment
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Label htmlFor="paymentAmount" className="text-sm font-medium">
                        Amount Received (Max: PKR {(order.outstandingPayment || 0).toLocaleString()})
                      </Label>
                      <Input
                        id="paymentAmount"
                        type="number"
                        placeholder="Enter amount"
                        value={paymentAmount}
                        onChange={(e) => handlePaymentAmountChange(e.target.value)}
                        max={order.outstandingPayment || 0}
                        min="0"
                        step="0.01"
                        className="text-sm"
                      />
                      
                      {error && (
                        <div className="flex items-center gap-2 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          {error}
                        </div>
                      )}

                        {paymentAmount && parseFloat(paymentAmount) > 0 && (
                          <div className="text-xs text-muted-foreground bg-white p-2 rounded border">
                            <div>Amount to be received: PKR {parseFloat(paymentAmount).toLocaleString()}</div>
                            {parseFloat(paymentAmount) >= (order.outstandingPayment || 0) ? (
                              <div className="text-green-700">
                                Change to return: PKR {(parseFloat(paymentAmount) - (order.outstandingPayment || 0)).toLocaleString()}
                              </div>
                            ) : (
                              <div>
                                Remaining outstanding: PKR {((order.outstandingPayment || 0) - parseFloat(paymentAmount)).toLocaleString()}
                              </div>
                            )}
                          </div>
                        )}

                      <div className="flex gap-2">
                        <Button 
                          onClick={handlePaymentUpdate}
                          disabled={isUpdatingPayment || !paymentAmount || parseFloat(paymentAmount) <= 0}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          {isUpdatingPayment ? 'Updating...' : 'Confirm Payment'}
                        </Button>
                        <Button 
                          onClick={() => {
                            setShowPaymentForm(false);
                            setPaymentAmount('');
                            setError('');
                          }}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Items Table */}
            <div className="text-sm">
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-sm border min-w-[300px]">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="py-2 px-2 border-b">Item</th>
                      <th className="py-2 px-2 border-b text-center">Qty</th>
                      <th className="py-2 px-2 border-b text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-2 border-b">
                          <div className="flex flex-col">
                            <span className="font-medium">{item.category.name} - {item.product.name} - {item.optionName}</span>
                            <span className='text-xs text-slate-600'>
                              Unit Price: {item.unitPrice.toLocaleString()}/rs
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-2 border-b text-center">{item.quantity}</td>
                        <td className="py-2 px-2 border-b text-right">
                          PKR {(item.unitPrice * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Totals */}
            <div className="border-t pt-2 text-sm space-y-1">
              <div className="flex justify-between">
                <span>Gross Total</span>
                <span>PKR {totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>PKR {discountRate}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total</span>
                <span>PKR {(discountedTotal || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Extra padding at bottom to prevent content being cut off */}
            <div className="h-4"></div>
          </div>
        </div>

        {/* Fixed Footer with Action Buttons */}
        <div className="flex-shrink-0 p-6 pt-4 border-t bg-background space-y-2">
          <Button 
            variant="default" 
            className="w-full"
            onClick={() => receiptPrinter.printReceipt(order)}
          >
            🧾 Print Customer Receipt
          </Button>

          <Button 
            variant="secondary" 
            className="w-full"
            onClick={() => receiptPrinter.printRestaurantCopy(order)}
          >
            🧾 Print Restaurant Receipt
          </Button>

          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ReceiptDrawer;