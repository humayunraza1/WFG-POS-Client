import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, UserPlus, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import useManager from '../hooks/userManager';

const AddAccountDialog = ({ 
  isOpen, 
  onClose, 
  employeeId, 
  employeeName, 
  userRole = 'manager',
  onAccountAdded 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { addAccount, loading: managerLoading } = useManager();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
      // Permission defaults
      isAdmin: false,
      isManager: false,
      isCashier: false,
      canViewOrders: false,
      canDeleteOrders: false,
      canAssignAccount: false,
      canViewEmployees: false,
      canAddEmployee: false,
      canDeleteEmployees: false,
      canEditRoles: false,
      canGenReport: false,
      canManageExpenses: false,
      canManageProducts: false
    }
  });

  // Watch for admin/manager changes to disable other permissions
  const watchIsAdmin = watch('isAdmin');
  const watchIsManager = watch('isManager');
  const isRoleSelected = watchIsAdmin || watchIsManager;

  // Define available permissions based on user role
  const getAvailablePermissions = () => {
    const basePermissions = [
      { key: 'isCashier', label: 'Cashier Access', description: 'Can process sales and transactions' },
      { key: 'canViewOrders', label: 'View Orders', description: 'Can view order history and details' },
      { key: 'canDeleteOrders', label: 'Delete Orders', description: 'Can remove orders from system' },
      { key: 'canGenReport', label: 'Generate Reports', description: 'Can create business reports' },
      { key: 'canManageExpenses', label: 'Manage Expenses', description: 'Can handle expense tracking' },
    ];
    
    if (userRole === 'admin') {
        return [
            { key: 'isAdmin', label: 'Admin Access', description: 'Full system access and control', priority: true },
            { key: 'isManager', label: 'Manager Access', description: 'Management level permissions', priority: true },
            { key: 'canAssignAccount', label: 'Assign Accounts', description: 'Can create accounts for employees' },
            { key: 'canViewEmployees', label: 'View Employees', description: 'Can see employee information' },
            { key: 'canAddEmployee', label: 'Add Employees', description: 'Can add new employees' },
            { key: 'canDeleteEmployees', label: 'Delete Employees', description: 'Can remove employees' },
            { key: 'canEditRoles', label: 'Edit Roles', description: 'Can modify employee roles' },
            { key: 'canManageProducts', label: 'Manage Products', description: 'Can add/edit products' },
        ...basePermissions
      ];
    }

    return basePermissions;
  };

  const availablePermissions = getAvailablePermissions();
  const priorityPermissions = availablePermissions.filter(p => p.priority);
  const regularPermissions = availablePermissions.filter(p => !p.priority);

  const handlePermissionChange = (permissionKey, checked) => {
    setValue(permissionKey, checked);
    
    // If admin or manager is selected, disable other options
    if ((permissionKey === 'isAdmin' || permissionKey === 'isManager') && checked) {
      // Clear other role selections
      if (permissionKey === 'isAdmin') {
        setValue('isManager', false);
      } else if (permissionKey === 'isManager') {
        setValue('isAdmin', false);
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      // Prepare the access object with only true values
      const access = {};
      Object.keys(data).forEach(key => {
        if (key !== 'username' && key !== 'password' && data[key] === true) {
          access[key] = true;
        }
      });

      await addAccount(employeeId, {
        username: data.username,
        password: data.password,
        access
      });

      toast.success('Account created successfully');
      reset();
      onAccountAdded?.();
      onClose();

    } catch (error) {
      console.error('Error creating account:', error);
      toast.error(error.message || 'Failed to create account');
      
      if (error.denied && error.denied.length > 0) {
        toast.error(`Denied permissions: ${error.denied.join(', ')}`);
      }
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create Account for {employeeName}
          </DialogTitle>
          <DialogDescription>
            Create a new user account with specific permissions. Choose the appropriate access level for this employee.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Credentials */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    {...register('username', { 
                      required: 'Username is required',
                      minLength: { value: 3, message: 'Username must be at least 3 characters' }
                    })}
                    className={errors.username ? 'border-red-500' : ''}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-500">{errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                      })}
                      className={errors.password ? 'border-red-500' : ''}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissions & Access
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {isRoleSelected 
                  ? "Admin/Manager roles automatically include all permissions below" 
                  : "Select specific permissions for this account"
                }
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Priority Permissions (Admin/Manager) */}
              {priorityPermissions.length > 0 && (
                <>
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      Role-Based Access
                    </h4>
                    {priorityPermissions.map((permission) => (
                      <div key={permission.key} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={permission.key}
                          checked={watch(permission.key)}
                          onCheckedChange={(checked) => handlePermissionChange(permission.key, checked)}
                        />
                        <div className="flex-1 min-w-0">
                          <Label 
                            htmlFor={permission.key}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {permission.label}
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator />
                </>
              )}

              {/* Regular Permissions */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Specific Permissions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {regularPermissions.map((permission) => (
                    <div key={permission.key} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={permission.key}
                        checked={watch(permission.key)}
                        onCheckedChange={(checked) => handlePermissionChange(permission.key, checked)}
                        disabled={isRoleSelected}
                      />
                      <div className="flex-1 min-w-0">
                        <Label 
                          htmlFor={permission.key}
                          className={`text-sm font-medium cursor-pointer ${
                            isRoleSelected ? 'text-muted-foreground' : ''
                          }`}
                        >
                          {permission.label}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={managerLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit(onSubmit)}
              disabled={managerLoading}
              className="flex items-center gap-2"
            >
              {managerLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountDialog;