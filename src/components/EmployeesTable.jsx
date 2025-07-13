import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, User, Phone, Mail, DollarSign, Loader2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import useManager from '../hooks/userManager';
import AddAccountDialog from './AddAccountDialog';
import EmployeeDrawer from './EmployeeDrawer';

const EmployeesTable = ({ employees = [], isLoading = false, user, onEmployeeUpdate }) => {
  const { addEmployee, loading: managerLoading } = useManager();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addAccountDialog, setAddAccountDialog] = useState({
    isOpen: false,
    employeeId: null,
    employeeName: ''
  });
    const [employeeDrawer, setEmployeeDrawer] = useState({
    isOpen: false,
    employee: null
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    salary: '',
    role: '',
    salaryDate: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Define available roles based on user access level
  const getAvailableRoles = () => {
    const baseRoles = ['cashier', 'chef', 'employee', 'cleaner', 'waiter'];
    if (user.access.isAdmin) {
      return [...baseRoles, 'manager', 'company'];
    }
    return baseRoles;
  };
  let role = user.access.isAdmin ? 'admin' : 'manager'
  const availableRoles = getAvailableRoles();

  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      cashier: 'bg-blue-100 text-blue-800 border-blue-200',
      manager: 'bg-purple-100 text-purple-800 border-purple-200',
      admin: 'bg-red-100 text-red-800 border-red-200',
      chef: 'bg-orange-100 text-orange-800 border-orange-200',
      employee: 'bg-gray-100 text-gray-800 border-gray-200',
      cleaner: 'bg-green-100 text-green-800 border-green-200',
      waiter: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      company: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };

    return (
      <Badge 
        variant="outline" 
        className={roleColors[role] || 'bg-gray-100 text-gray-800 border-gray-200'}
      >
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    if (!formData.salary) {
      errors.salary = 'Salary is required';
    } else if (isNaN(formData.salary) || parseFloat(formData.salary) <= 0) {
      errors.salary = 'Please enter a valid salary amount';
    }
    
    if (!formData.role) {
      errors.role = 'Role is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const employeeData = {
        ...formData,
        salary: parseFloat(formData.salary),
        salaryDate: parseInt(formData.salaryDate)
      };

      await addEmployee(employeeData);
      
      // Show success toast
      toast.success("Employee Added Successfully");

      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        phone: '',
        salary: '',
        role: '',
        salaryDate: ''
      });
      setFormErrors({});
      setIsModalOpen(false);

    } catch (error) {
      toast.error("Failed to Add Employee");
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      salary: '',
      role: '',
      salaryDate: ''
    });
    setFormErrors({});
  };

  const handleAddAccount = (employee) => {
    setAddAccountDialog({
      isOpen: true,
      employeeId: employee._id,
      employeeName: employee.name
    });
  };

  const handleCloseAddAccount = () => {
    setAddAccountDialog({
      isOpen: false,
      employeeId: null,
      employeeName: ''
    });
  };
  const handleOpenEmployeeDrawer = (employee) => {
    setEmployeeDrawer({
      isOpen: true,
      employee: employee
    });
  };

  const handleCloseEmployeeDrawer = () => {
    setEmployeeDrawer({
      isOpen: false,
      employee: null
    });
  };
  const handleAccountAdded = () => {
    // The addAccount function in useManager already refreshes the employees list
    // So we don't need to do anything here, but we can call onEmployeeUpdate if needed
    onEmployeeUpdate?.();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Employees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading employees...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Employees ({employees.length})
            </CardTitle>
            
            <Dialog open={isModalOpen} onOpenChange={(open) => {
              setIsModalOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>
                    Fill in the employee details below. All fields are required.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter employee name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={formErrors.name ? 'border-red-500' : ''}
                      />
                      {formErrors.name && (
                        <p className="text-sm text-red-500">{formErrors.name}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="employee@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={formErrors.email ? 'border-red-500' : ''}
                      />
                      {formErrors.email && (
                        <p className="text-sm text-red-500">{formErrors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={formErrors.phone ? 'border-red-500' : ''}
                      />
                      {formErrors.phone && (
                        <p className="text-sm text-red-500">{formErrors.phone}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="salary">Salary (USD)</Label>
                      <Input
                        id="salary"
                        type="number"
                        placeholder="50000"
                        min="0"
                        step="0.01"
                        value={formData.salary}
                        onChange={(e) => handleInputChange('salary', e.target.value)}
                        className={formErrors.salary ? 'border-red-500' : ''}
                      />
                      {formErrors.salary && (
                        <p className="text-sm text-red-500">{formErrors.salary}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">

                  <div className="space-y-2">
                      <Label htmlFor="salaryDate">Salary Date</Label>
                      <Select 
                        value={formData.salaryDate} 
                        onValueChange={(value) => handleInputChange('salaryDate', value)}
                      >
                        <SelectTrigger className={formErrors.salaryDate ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select salary date" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                            <SelectItem key={day} value={day.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.salaryDate && (
                        <p className="text-sm text-red-500">{formErrors.salaryDate}</p>
                      )}
                    </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(value) => handleInputChange('role', value)}
                      >
                      <SelectTrigger className={formErrors.role ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select employee role" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.role && (
                      <p className="text-sm text-red-500">{formErrors.role}</p>
                    )}
                  </div>
                    </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      disabled={managerLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={managerLoading}
                      className="flex items-center gap-2"
                    >
                      {managerLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Add Employee
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No employees found</h3>
              <p className="text-muted-foreground">There are no employees to display.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden lg:table-cell">Salary</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold">{employee.name}</div>
                            {/* Show email on mobile when email column is hidden */}
                            <div className="text-xs text-muted-foreground sm:hidden">
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{employee.email}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{employee.phone}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getRoleBadge(employee.role)}
                      </TableCell>
                      
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{formatSalary(employee.salary)}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {employee.accountRef ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            {employee.accountRef.username}
                          </Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => handleAddAccount(employee)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </TableCell>

                                            <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleOpenEmployeeDrawer(employee)}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Account Dialog */}
      <AddAccountDialog
        isOpen={addAccountDialog.isOpen}
        onClose={handleCloseAddAccount}
        employeeId={addAccountDialog.employeeId}
        employeeName={addAccountDialog.employeeName}
      userRole={role}
        onAccountAdded={handleAccountAdded}
      />
      <EmployeeDrawer userRole={role} isOpen={employeeDrawer.isOpen} onClose={handleCloseEmployeeDrawer} employee={employeeDrawer.employee}/>
    </>
  );
};

export default EmployeesTable;