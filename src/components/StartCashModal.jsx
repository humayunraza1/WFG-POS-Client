import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DollarSign, Loader2, User } from 'lucide-react';
import useManager from '../hooks/userManager';

const StartCashModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [startCash, setStartCash] = useState('');
  const [selectedManager, setSelectedManager] = useState('');
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [error, setError] = useState('');
  const {fetchEmployeesByRole} = useManager();
  const [managers,setManagers] = useState([])
  
  useEffect(()=>{
    const fetchManagers = async() =>{
      const data = await fetchEmployeesByRole('manager');
      setManagers(data)
    }
    fetchManagers()
  },[])

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const cashAmount = parseFloat(startCash);
    
    if (isNaN(cashAmount) || cashAmount < 0) {
      setError('Please enter a valid amount (0 or greater)');
      return;
    }

    if (!selectedManager) {
      setError('Please select a manager');
      return;
    }

    setError('');
    //console.log('Submitting start cash:', { startCash, manager: selectedManagerId });
    onSubmit({
      startCash: cashAmount,
      manager:selectedManager,
      managerId: selectedManagerId
    });
  };

  const handleClose = () => {
    setStartCash('');
    setSelectedManager('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Open Register
          </DialogTitle>
          <DialogDescription>
            Select the manager and enter the starting cash amount to begin your session.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manager">Manager</Label>
            <Select
              value={selectedManager}
              onValueChange={(e)=>{setSelectedManager(e.name); setSelectedManagerId(e.id)}}
              disabled={isLoading}
            >
              <SelectTrigger className={error && !selectedManager ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select manager">
                  {selectedManager && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {selectedManager}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {managers.map((manager) => (
                  <SelectItem key={manager._id} value={{name:manager.name, id: manager._id}}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {manager.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startCash">Starting Cash Amount (PKR)</Label>
            <Input
              id="startCash"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={startCash}
              onChange={(e) => setStartCash(e.target.value)}
              disabled={isLoading}
              className={error && isNaN(parseFloat(startCash)) ? 'border-red-500' : ''}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(e);
                }
              }}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          
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
                  Opening...
                </>
              ) : (
                'Open Register'
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StartCashModal;