import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { 
  Plus,
  Edit3,
  Trash2,
  Loader2,
  Receipt,
  AlertTriangle
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { useGetExpensesBySessionQuery } from '../../features/expense/expenseAPI';
import { useEffect } from 'react';
import { addExpense, deleteExpense, setExpenses, updateExpense } from '../../features/expense/expenseSlice';

// Move ExpenseForm outside the main component
const ExpenseForm = ({ onSubmit, isEdit = false, formData, setFormData, isSubmitting, onCancel }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="name">Expense Name *</Label>
      <Input
        id="name"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        placeholder="Enter expense name (e.g., Ingredients, Utilities)"
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="amount">Amount (PKR) *</Label>
      <Input
        id="amount"
        type="number"
        step="0.01"
        value={formData.amount}
        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
        placeholder="0.00"
        required
      />
    </div>

    <div className="flex justify-end gap-2">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEdit ? 'Update' : 'Add'} Expense
      </Button>
    </div>
  </form>
);

// Delete Confirmation Dialog Component
const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm, expenseName, isDeleting }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Confirm Deletion
        </DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <p>Are you sure you want to delete the expense <strong>"{expenseName}"</strong>?</p>
        <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const ExpensesView = () => {
  const dispatch = useDispatch()
  const {expenses,isLoading,error} = useSelector((state)=>state.expense)
  const {sessionId} = useSelector((state)=>state.register)
  const {data:allExpenses} = useGetExpensesBySessionQuery(sessionId,{skip:!sessionId})
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      amount: ''
    });
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;
    const expenseData ={
        name: formData.name,
        amount: parseFloat(formData.amount),
        
      }
        const res = await dispatch(addExpense({expenseData,sessionId}));
        //console.log(res)
        if(res.meta.requestStatus == 'fulfilled'){
          toast.success('Expense added successfully', {
            description: `${formData.name} - PKR ${parseFloat(formData.amount).toLocaleString()}`
          });
        }else{
          toast.error('Failed to add expense', {
            description: error || 'An error occurred while adding the expense'
          });
          
        }
        setIsAddDialogOpen(false);
        resetForm();
  };

  const handleEditExpense = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || !editingExpense) return;
    const expenseData = {
          name: formData.name,
        amount: parseFloat(formData.amount)
    }
     const res = await dispatch(updateExpense({id:editingExpense._id,expenseData}));
     //console.log(res)
      if (res.meta.requestStatus == 'fulfilled'){
        toast.success('Expense updated successfully', {
          description: `${formData.name} - PKR ${parseFloat(formData.amount).toLocaleString()}`
        });
      }else{
        toast.error('Failed to update expense', {
          description: error || 'An error occurred while updating the expense'
        });
      }
      
      setIsEditDialogOpen(false);
      setEditingExpense(null);
      resetForm();
  
  };

  const handleDeleteExpense = async () => {
    const res = await dispatch(deleteExpense(deletingExpense._id));
    //console.log(res)
      if(res.meta.requestStatus == 'fulfilled'){
        toast.success('Expense deleted successfully', {
          description: `${deletingExpense.name} has been removed`
        });
      }else{
        toast.error('Failed to delete expense', {
          description: error || 'An error occurred while deleting the expense'
        });

      }
      setIsDeleteDialogOpen(false);
      setDeletingExpense(null);
  };

  const openEditDialog = (expense) => {
    setEditingExpense(expense);
    setFormData({
      name: expense.name,
      amount: expense.amount.toString()
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (expense) => {
    setDeletingExpense(expense);
    setIsDeleteDialogOpen(true);
  };

  const handleCancelAdd = () => {
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setEditingExpense(null);
    resetForm();
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setDeletingExpense(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Expenses
          </CardTitle>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <ExpenseForm 
                onSubmit={handleAddExpense} 
                formData={formData}
                setFormData={setFormData}
                isSubmitting={isLoading}
                onCancel={handleCancelAdd}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading expenses...</span>
          </div>
        ) : expenses?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No expenses recorded yet</p>
            <p className="text-sm">Click "Add Expense" to get started</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {expenses?.map((expense) => (
                <div key={expense._id} className="flex justify-between items-center p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium">{expense?.name}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(expense?.dateAdded || expense?.createdAt)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="font-mono">
                      PKR {expense?.amount.toLocaleString()}
                    </Badge>
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(expense)}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDeleteDialog(expense)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Summary */}
        {expenses?.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Expenses:</span>
              <Badge variant="destructive" className="font-mono text-base">
                PKR {expenses.reduce((total, expense) => total + expense.amount, 0).toLocaleString()}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <ExpenseForm 
            onSubmit={handleEditExpense} 
            isEdit={true}
            formData={formData}
            setFormData={setFormData}
            isSubmitting={isLoading}
            onCancel={handleCancelEdit}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleDeleteExpense}
        expenseName={deletingExpense?.name || ''}
        isDeleting={isLoading}
      />
    </Card>
  );
};

export default ExpensesView;