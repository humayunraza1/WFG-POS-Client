import React, { useState, useEffect } from 'react';
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
import { Loader2, UserPlus, Shield, Eye, EyeOff, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import useManager from '../hooks/userManager';

const AddAccountDialog = ({ 
  isOpen, 
  onClose,
  handleClose, // Alternative prop name support
  employeeId, 
  employeeName, 
  userRole = 'manager',
  onAccountAdded,
  mode = 'create', // 'create' or 'edit'
  defaultValues = {} // For edit mode
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addAccount, loading: managerLoading ,updateAccount} = useManager();

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

  // Set form values when in edit mode
  useEffect(() => {
    if (mode === 'edit' && defaultValues) {
      // Set username
      if (defaultValues.username) {
        setValue('username', defaultValues.username);
      }
      
      // Set permissions from access object
      if (defaultValues.access) {
        Object.keys(defaultValues.access).forEach(key => {
          if (defaultValues.access[key] === true) {
            setValue(key, true);
          }
        });
      }
    }
  }, [mode, defaultValues, setValue]);

  // Watch for admin/manager changes to disable other permissions
  const watchIsAdmin = watch('isAdmin');
  const watchIsManager = watch('isManager');
  const isRoleSelected = watchIsAdmin || watchIsManager;

  // Define locked permissions for Manager role
  const managerLockedPermissions = {
    isCashier: false,
    canDeleteOrders: true,
    canAssignAccount: true,
    canViewEmployees: true,
    canAddEmployee: true,
    canDeleteEmployees: true,
    canEditRoles: true,
    canManageExpenses: true,
  };

  // Check if a permission is locked for current role
  const isPermissionLocked = (permissionKey) => {
    if (watchIsAdmin) return true; // Admin locks all permissions
    if (watchIsManager && managerLockedPermissions.hasOwnProperty(permissionKey)) {
      return true; // Manager locks specific permissions
    }
    return false;
  };

  // Get the locked value for a permission
  const getLockedPermissionValue = (permissionKey) => {
    if (watchIsAdmin) return true; // Admin gets all permissions
    if (watchIsManager && managerLockedPermissions.hasOwnProperty(permissionKey)) {
      return managerLockedPermissions[permissionKey];
    }
    return watch(permissionKey);
  };

  // Define available permissions based on user role
  const getAvailablePermissions = () => {
    const basePermissions = [
      { key: 'isCashier', label: 'Cashier Access', description: 'Can process sales and transactions' },
      { key: 'canDeleteOrders', label: 'Delete Orders', description: 'Can remove orders from system' },
      { key: 'canGenReport', label: 'Generate Reports', description: 'Can create business reports' },
      { key: 'canManageExpenses', label: 'Manage Expenses', description: 'Can handle expense tracking' },
    ];
    
    if (userRole === 'admin') {
        return [
            { key: 'isAdmin', label: 'Admin Access', description: 'Full system access and control', priority: true },
            { key: 'isManager', label: 'Manager Access', description: 'Management level permissions', priority: true },
            { key: 'canViewOrders', label: 'View Orders', description: 'Can view order history and details' },
            { key: 'canAssignAccount', label: 'Assign Accounts', description: 'Can create accounts for employees' },
            { key: 'canViewEmployees', label: 'View Employees', description: 'Can see employee information' },
            { key: 'canAddEmployee', label: 'Add Employees', description: 'Can add new employees' },
            { key: 'canDeleteEmployees', label: 'Delete Employees', description: 'Can remove employees' },
            { key: 'canViewAllRegisters', label: 'View All Registers', description: 'Can view registers of every manager.' },
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
    
    // If admin or manager is selected, disable other options and set locked values
    if ((permissionKey === 'isAdmin' || permissionKey === 'isManager') && checked) {
      // Clear other role selections
      if (permissionKey === 'isAdmin') {
        setValue('isManager', false);
        // Set all permissions to true for admin
        availablePermissions.forEach(permission => {
          if (permission.key !== 'isAdmin') {
            setValue(permission.key, true);
          }
        });
      } else if (permissionKey === 'isManager') {
        setValue('isAdmin', false);
        // Set locked permissions for manager
        Object.keys(managerLockedPermissions).forEach(key => {
          setValue(key, managerLockedPermissions[key]);
        });
      }
    }
    
    // If unchecking admin/manager, reset locked permissions
    if ((permissionKey === 'isAdmin' || permissionKey === 'isManager') && !checked) {
      if (permissionKey === 'isAdmin') {
        // Reset all permissions when unchecking admin
        availablePermissions.forEach(permission => {
          if (permission.key !== 'isAdmin') {
            setValue(permission.key, false);
          }
        });
      } else if (permissionKey === 'isManager') {
        // Reset locked permissions when unchecking manager
        Object.keys(managerLockedPermissions).forEach(key => {
          setValue(key, false);
        });
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Prepare the access object with only true values
      const access = {};
      Object.keys(data).forEach(key => {
        if (key !== 'username' && key !== 'password' && data[key] === true) {
          access[key] = true;
        }
      });

      const payload = {
        username: data.username,
        access
      };

      // Only include password in create mode or if it's provided in edit mode
      if (mode === 'create' || (mode === 'edit' && data.password)) {
        payload.password = data.password;
      }

      if (mode === 'edit') {
        await updateAccount(defaultValues.accountId,payload)
        toast.success("Account updated successfully");
      } else {
        // Use the existing addAccount function for create mode
        await addAccount(defaultValues.employeeId || employeeId, payload);
        toast.success('Account created successfully');
      }

      reset();
      onAccountAdded?.();
      (onClose || handleClose)();

    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} account:`, error);
      toast.error(error.response?.data?.message || error.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} account`);
      
      if (error.denied && error.denied.length > 0) {
        toast.error(`Denied permissions: ${error.denied.join(', ')}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    reset();
    (onClose || handleClose)();
  };

  const isLoading = loading || managerLoading;

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'edit' ? (
              <Edit3 className="h-5 w-5" />
            ) : (
              <UserPlus className="h-5 w-5" />
            )}
            {mode === 'edit' ? `Edit Account for ${employeeName}` : `Create Account for ${employeeName}`}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? "Update this employee's account credentials and permissions." 
              : "Create a new user account with specific permissions. Choose the appropriate access level for this employee."}
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
                  <Label htmlFor="password">
                    Password {mode === 'edit' && <span className="text-sm text-muted-foreground">(leave blank to keep current)</span>}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={mode === 'edit' ? "Enter new password (optional)" : "Enter password"}
                      {...register('password', { 
                        required: mode === 'create' ? 'Password is required' : false,
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
                {watchIsAdmin 
                  ? "Admin role automatically includes all permissions below" 
                  : watchIsManager
                  ? "Manager role has some locked permissions, others can be customized"
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
                        checked={getLockedPermissionValue(permission.key)}
                        onCheckedChange={(checked) => handlePermissionChange(permission.key, checked)}
                        disabled={isPermissionLocked(permission.key)}
                      />
                      <div className="flex-1 min-w-0">
                        <Label 
                          htmlFor={permission.key}
                          className={`text-sm font-medium cursor-pointer ${
                            isPermissionLocked(permission.key) ? 'text-muted-foreground' : ''
                          }`}
                        >
                          {permission.label}
                          {isPermissionLocked(permission.key) && (
                            <span className="ml-1 text-xs text-blue-500 font-normal">
                              (locked by {watchIsAdmin ? 'admin' : 'manager'} role)
                            </span>
                          )}
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
              onClick={handleDialogClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'edit' ? 'Update Account' : 'Create Account'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountDialog;