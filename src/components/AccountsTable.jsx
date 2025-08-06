import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle,DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, User, Calendar, Loader2, Edit, Shield, UserPlus, Trash2, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import useManager from '../hooks/userManager';
import AddAccountDialog from './AddAccountDialog';
import { useDispatch, useSelector } from 'react-redux';
import { assignAccountToEmployee, fetchAccounts, updateAccountStatus } from '../features/account/accountSlice';

const AccountsTable = () => {
  const {isAuthenticated,user} = useSelector((state)=>state.auth)
  const {accounts,isLoading,error} = useSelector((state)=>state.account)
  const dispatch = useDispatch()
  const { fetchEmployeesWithoutAccounts } = useManager();
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [addAccountDialog, setAddAccountDialog] = useState({
    isOpen: false,
    mode: 'add',
    accountData: null
  });
  const {branches, isLoading: branchesLoading, error: branchesError} = useSelector((state) => state.branch);
  const [selectedBranch, setSelectedBranch] = useState({ code: 'all', name: 'All Branches' });
  const [assignEmployeeDialog, setAssignEmployeeDialog] = useState({
    isOpen: false,
    accountId: null,
    accountUsername: ''
  });
  const [switchStates, setSwitchStates] = useState({});
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState({});
  const [confirmationPopover, setConfirmationPopover] = useState({
    isOpen: false,
    accountId: null,
    currentStatus: false,
    newStatus: false
  });

  let role = user.access?.isAdmin ? 'admin' : 'manager';

  useEffect(() => {
    dispatch(fetchAccounts())
  }, []);

  // Add this useEffect to initialize switch states when accounts change:
useEffect(() => {
  const initialStates = {};
  accounts.forEach(account => {
    initialStates[account._id] = account.isActive;
  });
  setSwitchStates(initialStates);
}, [accounts]);

  // Filter accounts when branch selection or accounts change
  useEffect(() => {
    if (selectedBranch.code === 'all') {
      setFilteredAccounts(accounts);
    } else {
      const filtered = accounts.filter(account => account.branchCode === selectedBranch.code);
      setFilteredAccounts(filtered);
    }
  }, [accounts, selectedBranch]);

  async function getAccounts() {
      dispatch(fetchAccounts());
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAccessBadge = (access) => {
    if (access.isAdmin) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
          <Shield className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      );
    } else if (access.isManager) {
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
          <Shield className="h-3 w-3 mr-1" />
          Manager
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
          <User className="h-3 w-3 mr-1" />
          Employee
        </Badge>
      );
    }
  };

  const getBranchName = (branchCode) => {
    if (!branchCode) return 'Unassigned';
    const branch = branches.find(b => b.branchCode === branchCode);
    return branch ? branch.name : branchCode;
  };

  const handleBranchFilterChange = (branchCode) => {
    if (branchCode === 'all') {
      setSelectedBranch({ code: 'all', name: 'All Branches' });
    } else {
      const branch = branches.find(b => b.branchCode === branchCode);
      setSelectedBranch({ code: branchCode, name: branch?.name || branchCode });
    }
  };
// Update your handleStatusChange function:
const handleStatusChange = (account, newStatus) => {
  // Update the switch state immediately for UI feedback
  setSwitchStates(prev => ({
    ...prev,
    [account._id]: newStatus
  }));

  setConfirmationPopover({
    isOpen: true,
    accountId: account._id,
    currentStatus: account.isActive,
    newStatus: newStatus
  });
};
  // Update your confirmStatusChange function:
const confirmStatusChange = async () => {
  const { accountId, newStatus } = confirmationPopover;
    //console.log(accountId,newStatus)
    setStatusUpdateLoading(prev => ({ ...prev, [accountId]: true })); 
    const res = await dispatch(updateAccountStatus({accountId, newStatus}));
    //console.log(res)
    if (res.meta.requestStatus == 'fulfilled'){
      
      // Update switch state to match the confirmed status
      setSwitchStates(prev => ({
        ...prev,
        [accountId]: newStatus
      }));
      
      toast.success(`Account ${newStatus ? 'activated' : 'deactivated'} successfully`);
      
    } else{
      toast.error(error);
      setConfirmationPopover({
        isOpen: false,
        accountId: null,
        currentStatus: false,
        newStatus: false
      });
    } 
    
    setStatusUpdateLoading(prev => ({ ...prev, [accountId]: false }));

};

    // Update your cancelStatusChange function:
    const cancelStatusChange = () => {
      // Revert the switch state to the actual account status
      if (confirmationPopover.accountId) {
        const account = accounts.find(acc => acc._id === confirmationPopover.accountId);
        if (account) {
          setSwitchStates(prev => ({
            ...prev,
            [confirmationPopover.accountId]: account.isActive
          }));
        }
      }

      setConfirmationPopover({
        isOpen: false,
        accountId: null,
        currentStatus: false,
        newStatus: false
      });
    };


  const handleAssignEmployee = async (account) => {
    try {
      // Fetch employees without accounts
      const employees = await fetchEmployeesWithoutAccounts();
      setAvailableEmployees(employees);
      setAssignEmployeeDialog({
        isOpen: true,
        accountId: account._id,
        accountUsername: account.username
      });
    } catch (error) {
      toast.error('Failed to fetch available employees');
      console.error(error);
    }
  };

  const handleCloseAssignDialog = () => {
    setAssignEmployeeDialog({
      isOpen: false,
      accountId: null,
      accountUsername: ''
    });
    setSelectedEmployeeId('');
    setAvailableEmployees([]);
  };

  const handleConfirmAssign = async () => {
    if (!selectedEmployeeId) {
      toast.error('Please select an employee');
      return;
    }
      //console.log(assignEmployeeDialog.accountId, selectedEmployeeId)
      const res = await dispatch(assignAccountToEmployee({accountId:assignEmployeeDialog.accountId, empId:selectedEmployeeId}));
      toast.success('Employee assigned successfully');
      handleCloseAssignDialog();
     toast.error(error.message || 'Failed to assign employee');
   
  };

  const resetForm = () => {
    setSelectedEmployeeId('');
    setAvailableEmployees([]);
    setAssignEmployeeDialog({
      isOpen: false,
      accountId: null,
      accountUsername: ''
    });
    setConfirmationPopover({
      isOpen: false,
      accountId: null,
      currentStatus: false,
      newStatus: false
    });
  };

  const handleAddAccount = () => {
    resetForm();
    setAddAccountDialog({
      isOpen: true,
      mode: 'create',
      accountData: null
    });
  };

  const handleEditAccount = (account) => {
    setAddAccountDialog({
      isOpen: true,
      mode: 'edit',
      accountData: {
        accountId: account._id,
        username: account.username,
        access: account.access,
        employeeId: account.employee?._id,
        employeeName: account.employee?.name,
        branchCode: account.branchCode
      }
    });
  };

  const handleCloseDialog = () => {
    setAddAccountDialog({
      isOpen: false,
      mode: 'add',
      accountData: null
    });
  };

  const handleUnassign = (accountId) => {
    toast('You can implement unassignment logic here.');
    // TODO: Implement backend call and refresh account list
  };

  const handleAccountUpdate = () => {
    getAccounts(); // Refresh the accounts list
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading accounts...</span>
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
              <Shield className="h-5 w-5" />
              Accounts ({filteredAccounts.length})
            </CardTitle>
            
            <div className="flex items-center gap-3">
              {/* Branch Filter - Only show for admin */}
              {user.access?.isAdmin && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={selectedBranch.code}
                    onValueChange={handleBranchFilterChange}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue>
                        {selectedBranch.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch.branchCode} value={branch.branchCode}>
                          {branch.name} ({branch.branchCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <Button className="flex items-center gap-2" onClick={handleAddAccount}>
                <Plus className="h-4 w-4" />
                Add Account
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAccounts.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {selectedBranch.code === 'all' ? 'No accounts found' : `No accounts found for ${selectedBranch.name}`}
              </h3>
              <p className="text-muted-foreground">
                {selectedBranch.code === 'all' 
                  ? 'There are no accounts to display.' 
                  : 'There are no accounts for the selected branch.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Employee</TableHead>
                    {user.access?.isAdmin && <TableHead>Branch</TableHead>}
                    <TableHead>Access Level</TableHead>
                    <TableHead className="hidden md:table-cell">Created At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold">{account.username}</div>
                            {/* Show created date on mobile when created at column is hidden */}
                            <div className="text-xs text-muted-foreground md:hidden">
                              {formatDate(account.createdAt)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                          {account?.employeeRef ? (
                            <div className="flex items-center gap-2">
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200">{account?.employeeRef?.name}</Badge>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-6 w-6 p-0 text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64">
                                  <p className="text-sm">Unassign <strong>{account.employeeRef.name}</strong> from this account?</p>
                                  <div className="mt-4 flex justify-end gap-2">
                                    <Button size="sm" variant="outline">Cancel</Button>
                                    <Button size="sm" className="bg-red-500 text-white" onClick={() => handleUnassign(account._id)}>
                                      Confirm
                                    </Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs flex items-center gap-1"
                            onClick={() => handleAssignEmployee(account)}
                          >
                            <UserPlus className="h-3 w-3" />
                            Assign
                          </Button>
                        )}
                      </TableCell>
                      
                      {user.access?.isAdmin && (
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {getBranchName(account.branchCode)}
                          </Badge>
                        </TableCell>
                      )}
                      
                      <TableCell>
                        {getAccessBadge(account.access)}
                      </TableCell>
                      
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(account.createdAt)}</span>
                        </div>
                      </TableCell>
                      
<TableCell>
  <Popover 
    open={confirmationPopover.isOpen && confirmationPopover.accountId === account._id}
    onOpenChange={(open) => {
      if (!open) cancelStatusChange();
    }}
  >
    <PopoverTrigger asChild>
      <div className="flex items-center gap-2">
        <Switch
          checked={switchStates[account._id] ?? account.isActive}
          onCheckedChange={(checked) => handleStatusChange(account, checked)}
          disabled={statusUpdateLoading[account._id]}
        />
        <Badge 
          variant={account.isActive ? "default" : "secondary"}
          className={account.isActive 
            ? "bg-green-100 text-green-800 border-green-200" 
            : "bg-red-100 text-red-800 border-red-200"
          }
        >
          {account.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>
    </PopoverTrigger>
    <PopoverContent className="w-80">
      <div className="space-y-3">
        <h4 className="font-medium">Confirm Status Change</h4>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to {confirmationPopover.newStatus ? 'activate ' : 'deactivate '} 
          the account for <strong>{account.username}</strong>?
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={cancelStatusChange}
            disabled={statusUpdateLoading[account._id]}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={confirmStatusChange}
            disabled={statusUpdateLoading[account._id]}
            className="flex items-center gap-2"
          >
            {statusUpdateLoading[account._id] && 
              <Loader2 className="h-3 w-3 animate-spin" />
            }
            Confirm
          </Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditAccount(account)}
                        >
                          <Edit className="h-4 w-4" />
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

      {/* Add/Edit Account Dialog */}
      <AddAccountDialog
        isOpen={addAccountDialog.isOpen}
        onClose={handleCloseDialog}
        handleClose={handleCloseDialog}
        mode={addAccountDialog.mode}
        defaultValues={addAccountDialog.accountData}
        userRole={role}
        employeeName={addAccountDialog.accountData?.employeeName || ''}
        employeeId={addAccountDialog.accountData?.employeeId}
        onAccountAdded={handleAccountUpdate}
        onAccountUpdated={handleAccountUpdate}
      />

      {/* Assign Employee Dialog */}
      <Dialog open={assignEmployeeDialog.isOpen} onOpenChange={handleCloseAssignDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Assign Employee</DialogTitle>
            <DialogDescription>
              Select an employee to assign to the account "{assignEmployeeDialog.accountUsername}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Select Employee</Label>
              <Select 
                value={selectedEmployeeId} 
                onValueChange={setSelectedEmployeeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {availableEmployees.length === 0 ? (
                    <SelectItem value="no-employees" disabled>
                      No employees available
                    </SelectItem>
                  ) : (
                    availableEmployees.map((employee) => (
                      <SelectItem key={employee._id} value={employee._id}>
                        {employee.name} - {employee.role}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseAssignDialog}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmAssign}
                disabled={isLoading || !selectedEmployeeId}
                className="flex items-center gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Assign Employee
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccountsTable;