import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  User,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  Plus,
  Loader2,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import useManager from '../hooks/userManager';
import AddAccountDialog from './AddAccountDialog';

const PAYMENT_TYPES = {
  ADVANCE: 'Advance',
  BONUS: 'Bonus',
  DEDUCTION: 'Deduction',
  SALARY: 'Salary'
};

const EmployeeDrawer = ({ isOpen, onClose, employee,userRole }) => {
  const { getEmployeePayments, addEmployeePayment, loading,getAccountDetails } = useManager();
  const [paymentData, setPaymentData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
const [editData, setEditData] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    type: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
    deductible: false
  });
  const [formErrors, setFormErrors] = useState({});
  // Generate month and year options
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  console.log("employee information: ", employee)
  useEffect(() => {
    if (isOpen && employee) {
      fetchPaymentData();
    }
  }, [isOpen, employee, selectedMonth, selectedYear]);

  const fetchPaymentData = async () => {
    if (!employee?._id) return;
    
    try {
      const data = await getEmployeePayments(employee._id, selectedMonth, selectedYear);
      setPaymentData(data);
    } catch (error) {
      toast.error('Failed to fetch payment data');
    }
  };

  const formatSalary = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateRange = () => {
    if (!paymentData?.cycleStart || !paymentData?.cycleEnd) return '';
    
    const startDate = new Date(paymentData.cycleStart);
    const endDate = new Date(paymentData.cycleEnd);
    
    const formatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    return `${startDate.toLocaleDateString('en-US', formatOptions)} - ${endDate.toLocaleDateString('en-US', formatOptions)}`;
  };

  async function editAccDetails(id){
    try{
      const data = await getAccountDetails(id)
          setEditData(data); // You will use this to prefill the dialog
    setIsEditOpen(true);
      console.log(data)
    }catch(err){
      console.log(err)
    }
  }

  const getPaymentTypeIcon = (type) => {
    switch (type) {
      case 'Advance':
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'Bonus':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'Deduction':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'Salary':
        return <Wallet className="h-4 w-4 text-purple-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPaymentTypeBadge = (type) => {
    const colors = {
      'Advance': 'bg-blue-100 text-blue-800 border-blue-200',
      'Bonus': 'bg-green-100 text-green-800 border-green-200',
      'Deduction': 'bg-red-100 text-red-800 border-red-200',
      'Salary': 'bg-purple-100 text-purple-800 border-purple-200'
    };

    return (
      <Badge variant="outline" className={colors[type] || 'bg-gray-100 text-gray-800 border-gray-200'}>
        {type}
      </Badge>
    );
  };

  const validatePaymentForm = () => {
    const errors = {};
    
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
    }
    
    if (!paymentForm.type) {
      errors.type = 'Please select a payment type';
    }
    
    if (!paymentForm.date) {
      errors.date = 'Please select a date';
    } else if (new Date(paymentForm.date) > new Date()) {
      errors.date = 'Date cannot be in the future';
    }
    
    if (!paymentForm.note.trim()) {
      errors.note = 'Please add a note';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePaymentFormChange = (field, value) => {
    setPaymentForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear specific field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePaymentSubmit = async () => {
    if (!validatePaymentForm()) return;
    
    try {
      const paymentData = {
        ...paymentForm,
        amount: parseFloat(paymentForm.amount)
      };
      
      await addEmployeePayment(employee._id, paymentData);
      toast.success('Payment added successfully');
      
      // Reset form and close dialog
      setPaymentForm({
        amount: '',
        type: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
        deductible: false
      });
      setFormErrors({});
      setIsPaymentDialogOpen(false);
      
      // Refresh payment data
      fetchPaymentData();
    } catch (error) {
      toast.error('Failed to add payment');
    }
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      amount: '',
      type: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
      deductible: false
    });
    setFormErrors({});
  };

  if (!employee) return null;

  const closeDialog = () => {
  setEditData(null);
  setIsEditOpen(false);
};

  return (
    <>
        {editData && (
      <AddAccountDialog
        isOpen={isEditOpen}
        handleClose={closeDialog}
        mode="edit"
        defaultValues={{
          username: editData.username,
          access: editData.access,
          accountId: editData._id,
          employeeId: editData.employee?._id,
        }}
        userRole={userRole}
        employeeName={editData.employee?.name || 'Employee'}
      />
    )}
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg lg:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Employee Details
          </SheetTitle>
          <SheetDescription>
            View and manage employee information and payment history
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6 px-2">
          {/* Account details */}
<Card className="shadow-md rounded-2xl border">
  <CardHeader className="pb-2">
    <CardTitle className="text-lg">Account Information</CardTitle>
  </CardHeader>
  <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground font-medium">Username:</span>
      <span className="text-foreground font-semibold">{employee.accountRef?.username || 'N/A'}</span>
    </div>

    <div className="flex justify-between items-center">
      <span className="text-muted-foreground font-medium">Role:</span>
      <span className="capitalize font-semibold text-foreground">{employee.role}</span>
    </div>

    <div className="flex justify-between items-center">
      <span className="text-muted-foreground font-medium">Created At:</span>
      <span className="font-semibold">{new Date(employee.accountRef?.createdAt).toLocaleDateString()}</span>
    </div>

    <div className="pt-4 flex justify-end">
      <Button 
        size="sm" 
        variant="default"
        onClick={() => editAccDetails(employee.accountRef?._id)}
      >
        Edit Account
      </Button>
    </div>
  </CardContent>
</Card>
          {/* Employee Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Employee Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-semibold">{employee.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{employee.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-semibold">{employee.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Salary</p>
                    <p className="font-semibold">{formatSalary(employee.salary)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          {paymentData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Monthly Salary</p>
                    <p className="font-bold text-lg">{formatSalary(paymentData.monthlySalary)}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Paid as Advance</p>
                    <p className="font-bold text-lg text-blue-600">{formatSalary(paymentData.paidAsAdvance)}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Paid as Bonus</p>
                    <p className="font-bold text-lg text-green-600">{formatSalary(paymentData.paidAsBonus)}</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Deductions</p>
                    <p className="font-bold text-lg text-red-600">{formatSalary(paymentData.deductions)}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Final Salary Paid</p>
                    <p className="font-bold text-lg text-purple-600">{formatSalary(paymentData.finalSalaryPaid)}</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Remaining Salary</p>
                    <p className="font-bold text-lg text-orange-600">{formatSalary(paymentData.remainingSalary)}</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                    <p className="font-bold text-lg text-cyan-600">{formatSalary(paymentData.totalPaid)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment History */}
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Payment History</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDateRange()}
                    </p>
                  </div>
                  <Dialog open={isPaymentDialogOpen} onOpenChange={(open) => {
                    setIsPaymentDialogOpen(open);
                    if (!open) resetPaymentForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Payment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Add Payment</DialogTitle>
                        <DialogDescription>
                          Add a new payment entry for {employee.name}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                              id="amount"
                              type="number"
                              placeholder="Enter amount"
                              value={paymentForm.amount}
                              onChange={(e) => handlePaymentFormChange('amount', e.target.value)}
                              className={formErrors.amount ? 'border-red-500' : ''}
                            />
                            {formErrors.amount && (
                              <p className="text-sm text-red-500">{formErrors.amount}</p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="type">Payment Type</Label>
                            <Select 
                              value={paymentForm.type} 
                              onValueChange={(value) => handlePaymentFormChange('type', value)}
                            >
                              <SelectTrigger className={formErrors.type ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(PAYMENT_TYPES).map(([key, value]) => (
                                  <SelectItem key={key} value={value}>
                                    {value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {formErrors.type && (
                              <p className="text-sm text-red-500">{formErrors.type}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            max={new Date().toISOString().split('T')[0]}
                            value={paymentForm.date}
                            onChange={(e) => handlePaymentFormChange('date', e.target.value)}
                            className={formErrors.date ? 'border-red-500' : ''}
                          />
                          {formErrors.date && (
                            <p className="text-sm text-red-500">{formErrors.date}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="note">Note</Label>
                          <Textarea
                            id="note"
                            placeholder="Add a note about this payment"
                            value={paymentForm.note}
                            onChange={(e) => handlePaymentFormChange('note', e.target.value)}
                            className={formErrors.note ? 'border-red-500' : ''}
                          />
                          {formErrors.note && (
                            <p className="text-sm text-red-500">{formErrors.note}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="deductible"
                            checked={paymentForm.deductible}
                            onCheckedChange={(checked) => handlePaymentFormChange('deductible', checked)}
                          />
                          <Label htmlFor="deductible" className="text-sm font-medium">
                            This payment is deductible
                          </Label>
                        </div>
                        
                        <div className="flex justify-end gap-3 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsPaymentDialogOpen(false)}
                            disabled={loading}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handlePaymentSubmit}
                            disabled={loading}
                            className="flex items-center gap-2"
                          >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Add Payment
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading payment history...</span>
                </div>
              ) : paymentData?.paymentHistory?.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No payment history</h3>
                  <p className="text-muted-foreground">No payments found for the selected period.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Payment Type</TableHead>
                        <TableHead>Manager</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentData?.paymentHistory?.map((payment, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {formatDate(payment.date)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                {getPaymentTypeIcon(payment.type)}
                                {getPaymentTypeBadge(payment.type)}
                              </div>
                              {payment.note && (
                                <p className="text-xs text-muted-foreground">{payment.note}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{payment.manager}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatSalary(payment.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
};

export default EmployeeDrawer;