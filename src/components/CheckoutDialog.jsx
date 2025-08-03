import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, DollarSign, Receipt, User } from 'lucide-react';
import useManager from '../hooks/userManager';
import { toast } from 'sonner';
import {useTempOrders} from '../hooks/useTempOrders';
import { useSelector } from 'react-redux';

const CheckoutDialog = ({ 
  isOpen, 
  onClose,
  serverData,
  orderData, 
  onConfirmOrder,
}) => {
  const {isLoading:isProcessing} = useSelector((state)=>state.orders)
  const {businessPrefs} = useSelector((state)=>state.settings);
  const [amountReceived, setAmountReceived] = useState('');
  const [selectedServerId, setSelectedServerId] = useState('');
  const [error, setError] = useState('');
  const {fetchEmployeesByRole} = useManager();
  const [server, setServer] = useState([]);
  const {addTempOrder} = useTempOrders()
  useEffect(() => {
    console.log(businessPrefs)
    const fetchWaiters = async () => {
      try {
        const data = await fetchEmployeesByRole('server');
        console.log("servers fetched: ",data)
        setServer(data)
      } catch(err) {
        setServer([])
        toast.error("Unable to fetch servers list")
        console.log(err)
      }
    } 
      fetchWaiters()
  }, [])

  // Reset state when dialog opens with new order data
  useEffect(() => {
    if (isOpen && orderData) {
      setAmountReceived('');
      setSelectedServerId('');
      setError('');
    }
  }, [isOpen, orderData]);

  if (!orderData) return null;

  const { finalPrice, discount, paymentType, items } = orderData;
  const amountReceivedNum = parseFloat(amountReceived) || 0;
  const outstandingPayment = Math.max(0, finalPrice - amountReceivedNum);
  const isValidAmount = amountReceivedNum >= 0 && amountReceivedNum <= finalPrice;

  const handleAmountChange = (value) => {
    setAmountReceived(value);
    setError('');
    
    if (value && parseFloat(value) > finalPrice) {
      setError(`Amount cannot exceed total of PKR ${finalPrice.toLocaleString()}`);
    }
  };

  const handleConfirm = () => {
    if (!isValidAmount) {
      setError('Please enter a valid amount');
      return;
    }

    // Check if server selection is required but not provided
    if (businessPrefs?.trackServers && !selectedServerId) {
      setError('Please select a server/waiter');
      return;
    }
    let name = server.find(s => s._id === selectedServerId)?.name
    const finalOrderData = {
      ...orderData,
      amountPaid: amountReceivedNum,
      outstandingPayment: outstandingPayment,
      serverId: businessPrefs?.trackServers ? selectedServerId : null,
    };
    const finalTempOrder = {items:serverData,serverName:name}
    addTempOrder(finalTempOrder)
    onConfirmOrder(finalOrderData);
  };

  const handleClose = () => {
    setAmountReceived('');
    setSelectedServerId('');
    setError('');
    onClose();
  };

  const getPaymentStatusBadge = () => {
    if (outstandingPayment === 0) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Fully Paid</Badge>;
    } else if (amountReceivedNum > 0) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Partial Payment</Badge>;
    } else {
      return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Pending Payment</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Complete Order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Summary */}
          <Card className="border-2">
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Items ({items.length}):</span>
                  <span>{items.reduce((sum, item) => sum + item.quantity, 0)} qty</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Type:</span>
                  <span className="capitalize font-medium">{paymentType}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount}Rs):</span>
                    <span>Applied</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount:</span>
                  <span>PKR {finalPrice.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Server Selection - Only show if trackServers is enabled */}
         {businessPrefs?.trackServers && (
  <div className="space-y-3">
    <Label htmlFor="serverSelect" className="text-sm font-medium">
      Select Server/Waiter
    </Label>
    <div className="relative">
      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
      <Select value={selectedServerId} onValueChange={setSelectedServerId}>
        <SelectTrigger className="pl-10">
          <SelectValue placeholder="Choose server/waiter">
            {selectedServerId ? server.find(s => s._id === selectedServerId)?.name || `Server ${selectedServerId}` : "Choose server/waiter"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {server.length === 0 ? (
            <SelectItem value="no-servers" disabled>
              No servers found
            </SelectItem>
          ) : (
            server.map((serverItem) => (
              <SelectItem key={serverItem._id} value={serverItem._id}>
                {serverItem.name || `Server ${serverItem.id}`}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  </div>
)}

          {/* Payment Input */}
          <div className="space-y-3">
            <Label htmlFor="amountReceived" className="text-sm font-medium">
              Amount Received from Customer
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="amountReceived"
                type="number"
                placeholder="0.00"
                value={amountReceived}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="pl-10"
                min="0"
                max={finalPrice}
                step="0.01"
                autoFocus
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-xs">
                <AlertCircle className="w-3 h-3" />
                {error}
              </div>
            )}
          </div>

          {/* Payment Status */}
          {amountReceived && (
            <Card className={`border-2 ${outstandingPayment > 0 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Payment Status:</span>
                    {getPaymentStatusBadge()}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Amount Received:</span>
                      <span className="font-semibold text-green-600">
                        PKR {amountReceivedNum.toLocaleString()}
                      </span>
                    </div>
                    
                    {outstandingPayment > 0 && (
                      <div className="flex justify-between">
                        <span>Outstanding Payment:</span>
                        <span className="font-semibold text-red-600">
                          PKR {outstandingPayment.toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    {amountReceivedNum > finalPrice && (
                      <div className="flex justify-between">
                        <span>Change to Return:</span>
                        <span className="font-semibold text-blue-600">
                          PKR {(amountReceivedNum - finalPrice).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Quick Select:</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAmountChange(finalPrice.toString())}
                className="text-xs"
              >
                Full Amount
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAmountChange((finalPrice / 2).toString())}
                className="text-xs"
              >
                Half Payment
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAmountChange('0')}
                className="text-xs"
              >
                No Payment
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValidAmount || isProcessing || error || (businessPrefs?.trackServers && !selectedServerId)}
            className="min-w-[120px]"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Receipt className="w-4 h-4 mr-2" />
                Complete Order
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;