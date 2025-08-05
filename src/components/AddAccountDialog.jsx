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
import { Select, SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, UserPlus, Shield, Eye, EyeOff, Edit3, Building } from 'lucide-react';
import { toast } from 'sonner';
import useManager from '../hooks/userManager';
import useBranch from '../hooks/useBranch';
import { addAccount, updateAccount } from '../features/account/accountSlice';

const AddAccountDialog = ({ 
  isOpen, 
  onClose,
  handleClose, // Alternative prop name support
  employeeId, 
  employeeName, 
  userRole = 'manager',
  onAccountAdded,
  mode = 'create', // 'create' or 'edit'
  defaultValues = {}, // For edit mode
  branches: propBranches = [] // Branches passed from parent
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loading: managerLoading} = useManager();
  const [branches, setBranches] = useState([]);
  const { getBranch } = useBranch();

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
      branchCode: '',
      // Permission defaults
      isAdmin: false,
      isManager: false,
      isCashier: false,
      canViewOrders: false,
      canGenReport: false,
      canDeleteOrder: false,
      canAddExpense: false,
    }
  });

  // Fetch branches on component mount if admin and branches not provided
  useEffect(() => {
    if (userRole === 'admin') {
      if (propBranches && propBranches.length > 0) {
        setBranches(propBranches);
      } else {
        const fetchBranches = async () => {
          try {
            const data = await getBranch();
            setBranches(data || []);
          } catch (err) {
            console.error('Failed to fetch branches:', err);
            toast.error('Failed to fetch branches');
          }
        };
        fetchBranches();
      }
    }
  }, [userRole, propBranches, getBranch]);

  // Set form values when in edit mode
  useEffect(() => {
    if (mode === 'edit' && defaultValues) {
      // Set username
      if (defaultValues.username) {
        setValue('username', defaultValues.username);
      }
 
      // Set branch code - find the matching branch and set it
      if (defaultValues.branchCode) {
        setValue('branchCode', defaultValues.branchCode);
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

  // Watch for admin/manager/cashier changes to disable other permissions
  const watchIsAdmin = watch('isAdmin');
  const watchIsManager = watch('isManager');
  const watchIsCashier = watch('isCashier');
  const isRoleSelected = watchIsAdmin || watchIsManager || watchIsCashier;

  // Check if a permission is locked for current role
  const isPermissionLocked = (permissionKey) => {
    if (watchIsAdmin) return true; // Admin locks all permissions
    
    // For cashier role, only lock non-cashier-specific permissions
    if (watchIsCashier) {
      const cashierOptionalPermissions = ['canDeleteOrder', 'canAddExpense'];
      return !cashierOptionalPermissions.includes(permissionKey);
    }
    
    return false;
  };

  // Get the locked value for a permission
  const getLockedPermissionValue = (permissionKey) => {
    if (watchIsAdmin) return true; // Admin gets all permissions
    
    // For cashier role, allow optional permissions to be toggled
    if (watchIsCashier) {
      const cashierOptionalPermissions = ['canDeleteOrder', 'canAddExpense'];
      if (cashierOptionalPermissions.includes(permissionKey)) {
        return watch(permissionKey); // Allow manual control
      }
      return false; // Other permissions are disabled for cashiers
    }
    
    return watch(permissionKey);
  };

  // Get current branch name for display
  const getCurrentBranchName = () => {
    const currentBranchCode = watch('branchCode');
    if (!currentBranchCode) return 'Not specified';
    const branch = branches.find(b => b.branchCode === currentBranchCode);
    return branch ? `${branch.name} (${branch.branchCode})` : currentBranchCode;
  };

  // Handle branch selection change
  const handleBranchChange = (value) => {
    const branchCode = value === 'none' ? '' : value;
    setValue('branchCode', branchCode);
  };

  // Define available permissions based on user role
  const getAvailablePermissions = () => {
    const basePermissions = [
      { key: 'canGenReport', label: 'Generate Reports', description: 'Can create business reports' },
    ];

    const cashierOptionalPermissions = [
      { key: 'canDeleteOrder', label: 'Delete Orders', description: 'Allow cashier to delete orders' },
      { key: 'canAddExpense', label: 'Add Expenses', description: 'Allow cashier to add expenses (edit/delete by manager only)' },
    ];
    
    if (userRole === 'admin') {
        return [
            { key: 'isManager', label: 'Manager Access', description: 'Management level permissions', priority: true },
            { key: 'isCashier', label: 'Cashier Access', description: 'Can process sales and transactions only', priority: true },
            { key: 'canViewOrders', label: 'View Orders', description: 'Can view order history and details' },
            { key: 'canViewAllRegisters', label: 'View All Registers', description: 'Can view registers of every manager.' },
            ...cashierOptionalPermissions,
            ...basePermissions
      ];
    }

    // For manager role, show cashier access and cashier-specific permissions
    if (userRole === 'manager') {
      return [
        { key: 'isCashier', label: 'Cashier Access', description: 'Can process sales and transactions only', priority: true },
        ...cashierOptionalPermissions
      ];
    }

 return [
      { key: 'isCashier', label: 'Cashier Access', description: 'Can process sales and transactions only', priority: true },
      ...cashierOptionalPermissions,
      ...basePermissions
    ];
  };

  const availablePermissions = getAvailablePermissions();
  const priorityPermissions = availablePermissions.filter(p => p.priority);
  const regularPermissions = availablePermissions.filter(p => !p.priority);

  const handlePermissionChange = (permissionKey, checked) => {
    setValue(permissionKey, checked);
    
    // If admin, manager, or cashier is selected, handle other permissions accordingly
    if ((permissionKey === 'isAdmin' || permissionKey === 'isManager' || permissionKey === 'isCashier') && checked) {
      // Clear other role selections
      if (permissionKey === 'isAdmin') {
        setValue('isManager', false);
        setValue('isCashier', false);
        // Set all permissions to true for admin
        availablePermissions.forEach(permission => {
          if (permission.key !== 'isAdmin') {
            setValue(permission.key, true);
          }
        });
      } else if (permissionKey === 'isManager') {
        setValue('isAdmin', false);
        setValue('isCashier', false);
        // No locked permissions for manager - just clear conflicting roles
      } else if (permissionKey === 'isCashier') {
        setValue('isAdmin', false);
        setValue('isManager', false);
        // For cashier, disable non-optional permissions but keep optional ones as they are
        const cashierOptionalPermissions = ['canDeleteOrder', 'canAddExpense'];
        availablePermissions.forEach(permission => {
          if (permission.key !== 'isCashier' && !cashierOptionalPermissions.includes(permission.key)) {
            setValue(permission.key, false);
          }
          // Keep canDeleteOrder and canAddExpense at their current values (defaulting to false)
        });
      }
    }
    
    // If unchecking admin/manager/cashier, reset locked permissions
    if ((permissionKey === 'isAdmin' || permissionKey === 'isManager' || permissionKey === 'isCashier') && !checked) {
      if (permissionKey === 'isAdmin') {
        // Reset all permissions when unchecking admin
        availablePermissions.forEach(permission => {
          if (permission.key !== 'isAdmin') {
            setValue(permission.key, false);
          }
        });
      } else if (permissionKey === 'isCashier') {
        // Reset all permissions when unchecking cashier, including optional ones
        availablePermissions.forEach(permission => {
          if (permission.key !== 'isCashier') {
            setValue(permission.key, false);
          }
        });
      }
      // No special handling needed for manager since there are no locked permissions
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Prepare the access object with only true values
      const access = {};
      Object.keys(data).forEach(key => {
        if (key !== 'username' && key !== 'password' && key !== 'branchCode' && data[key] === true) {
          access[key] = true;
        }
      });

      const payload = {
        username: data.username,
        access,
        branchCode: data.branchCode || null
      };

      // Only include password in create mode or if it's provided in edit mode
      if (mode === 'create' || (mode === 'edit' && data.password)) {
        payload.password = data.password;
      }

      if (mode === 'edit') {
        const res = await dispatch(updateAccount({accountId:defaultValues.accountId, status:payload}));
        console.log(payload)
        if(res.meta.requestStatus == 'fulfilled'){
          toast.success("Account updated successfully");
        }else{
          toast.error(res.payload);
        }
      } else {
        // Use the existing addAccount function for create mode
        const res = await dispatch(addAccount(payload));
        if(res.meta.requestStatus == 'fulfilled'){
          toast.success('Account created successfully');
        }else{
          toast.error(res.payload)
        }
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
              
              {/* Branch Selection - Only show for admin */}
              {userRole === 'admin' && (
                <div className="space-y-2">
                  <Label htmlFor="branchCode" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Branch Assignment
                  </Label>
                  <Select
                    value={watch('branchCode') || 'none'}
                    onValueChange={handleBranchChange}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {watch('branchCode') ? (
                          (() => {
                            const branch = branches.find(b => b.branchCode === watch('branchCode'));
                            return branch ? `${branch.name} (${branch.branchCode})` : watch('branchCode');
                          })()
                        ) : (
                          <span className="text-muted-foreground italic">Not specified</span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <span className="text-muted-foreground italic">Not specified</span>
                      </SelectItem>
                      {branches.map((branch, idx) => (
                        <SelectItem key={idx} value={branch.branchCode}>
                          {branch.name} ({branch.branchCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Current: <span className="font-medium">{getCurrentBranchName()}</span>
                  </p>
                </div>
              )}
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
                  : watchIsCashier
                  ? "Cashier role has limited access - additional permissions can be granted optionally"
                  : userRole === 'manager'
                  ? "As a manager, you can assign cashier access and optional cashier permissions"
                  : "Select specific permissions for this account"
                }
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Priority Permissions (Admin/Manager/Cashier) */}
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
                  {regularPermissions.length > 0 && <Separator />}
                </>
              )}

              {/* Regular Permissions - Only show if not manager role or if there are regular permissions available */}
              {regularPermissions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    {watchIsCashier ? 'Optional Cashier Permissions' : 'Specific Permissions'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {regularPermissions.map((permission) => {
                      const isLocked = isPermissionLocked(permission.key);
                      const isCashierOptional = watchIsCashier && ['canDeleteOrder', 'canAddExpense'].includes(permission.key);
                      
                      return (
                        <div key={permission.key} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            id={permission.key}
                            checked={getLockedPermissionValue(permission.key)}
                            onCheckedChange={(checked) => handlePermissionChange(permission.key, checked)}
                            disabled={isLocked}
                          />
                          <div className="flex-1 min-w-0">
                            <Label 
                              htmlFor={permission.key}
                              className={`text-sm font-medium cursor-pointer ${
                                isLocked ? 'text-muted-foreground' : ''
                              }`}
                            >
                              {permission.label}
                              {isLocked && (
                                <span className="ml-1 text-xs text-blue-500 font-normal">
                                  (locked by {watchIsAdmin ? 'admin' : 'cashier'} role)
                                </span>
                              )}
                              {isCashierOptional && (
                                <span className="ml-1 text-xs text-green-600 font-normal">
                                  (optional for cashier)
                                </span>
                              )}
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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