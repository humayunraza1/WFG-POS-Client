import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DollarSign, Loader2, Calculator } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Banknote, CreditCard } from "lucide-react";

const FinalCashModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading, 
  registerData,
  totalCash = 0,
  totalOnline = 0, 
  totalPending = 0,
  expectedCash = 0,
  expectedOnline = 0,
  totalSales = 0, 
  totalExpenses = 0 
}) => {
  const [finalCash, setFinalCash] = useState('');
  const [error, setError] = useState('');
  console.log(totalCash, totalOnline, totalPending, totalSales, totalExpenses);
  const expectedClosingCash = (registerData?.startCash || 0) + expectedCash - totalExpenses;
  const difference = finalCash ? parseFloat(finalCash) - expectedClosingCash : 0;
  console.log()
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const cashAmount = parseFloat(finalCash);
    
    if (isNaN(cashAmount) || cashAmount < 0) {
      setError('Please enter a valid amount (0 or greater)');
      return;
    }

    setError('');
    onSubmit(cashAmount);
  };

  const handleClose = () => {
    setFinalCash('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Close Register
          </DialogTitle>
          <DialogDescription>
            Count the cash in the register and enter the final amount to close your session.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Session Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Session Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Starting Cash:</span>
                <p className="font-medium">PKR {(registerData?.startCash || 0).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Cash Payments:</span>
                <p className="font-medium ">+PKR {totalCash.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Online Payments:</span>
                <p className="font-medium ">+PKR {totalOnline.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Sales:</span>
                <p className="font-medium text-green-600">+PKR {totalSales.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Expenses:</span>
                <p className="font-medium text-red-600">-PKR {totalExpenses.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Expected Cash:</span>
                <p className="font-medium">PKR {expectedClosingCash.toLocaleString()}</p>
              </div>
            </div>
          </div>
{totalPending > 0 && (
  <Alert variant="destructive">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Pending Payments</AlertTitle>
    <AlertDescription>
      <p className="mb-2">
        You have pending payments totaling <span className="font-semibold">PKR {totalPending.toLocaleString()}</span>.
      </p>
      <div className="flex gap-6 text-sm">
        {/* Cash Pending */}
        <div className="flex items-center gap-2">
          <Banknote className="h-4 w-4 text-yellow-600" />
          <span>Cash: <span className="font-semibold">PKR {(expectedCash - totalCash).toLocaleString()}</span></span>
        </div>
        {/* Online Pending */}
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-blue-600" />
          <span>Online: <span className="font-semibold">PKR {(expectedOnline - totalOnline).toLocaleString()}</span></span>
        </div>
      </div>
    </AlertDescription>
  </Alert>
)}
          {/* Final Cash Input */}
          <div className="space-y-2">
            <Label htmlFor="finalCash">Final Cash Count (PKR)</Label>
            <Input
              id="finalCash"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={finalCash}
              onChange={(e) => setFinalCash(e.target.value)}
              disabled={isLoading}
              className={error ? 'border-red-500' : ''}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(e);
                }
              }}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            
            {/* Difference Indicator */}
            {finalCash && !isNaN(parseFloat(finalCash)) && (
              <div className={`text-sm p-2 rounded ${
                Math.abs(difference) < 0.01 
                  ? 'bg-green-50 text-green-700' 
                  : difference > 0 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'bg-yellow-50 text-yellow-700'
              }`}>
                {Math.abs(difference) < 0.01 
                  ? '✓ Cash count matches expected amount' 
                  : difference > 0 
                    ? `Cash Over: +PKR ${difference.toLocaleString()}` 
                    : `Cash Short: PKR ${Math.abs(difference).toLocaleString()}`
                }
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Closing...
                </>
              ) : (
                'Close Register'
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinalCashModal;