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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Building, MapPin, Phone, Edit, Loader2, Users, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import useBranch from '../hooks/useBranch';
import useManager from '../hooks/userManager';

const BranchTable = ({ user }) => {
  const { getBranch, addBranch, updateBranch, loading: branchLoading } = useBranch();
  const { fetchManagers,assignManagers } = useManager();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [branches, setBranches] = useState([]);
  const [managers, setManagers] = useState([]);
  const [selectedBranchForManager, setSelectedBranchForManager] = useState(null);
  const [selectedManagers, setSelectedManagers] = useState([]);
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [managersLoading, setManagersLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    code: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchBranches();
    fetchManagersList();
  }, []);

  const fetchManagersList = async () => {
    try {
      const data = await fetchManagers();
      console.log("managers: ", data);
      setManagers(data || []);
    } catch (err) {
      toast.error("Failed to fetch managers");
      console.log(err);
      setManagers([]);
    }
  };

  const handleAssignManager = (branch) => {
    setSelectedBranchForManager(branch);
    // Get currently assigned manager IDs for this branch
    const assignedManagerIds = branch.managers || [];
    setSelectedManagers(assignedManagerIds);
    setIsManagerModalOpen(true);
  };

  const handleManagerSelection = (managerId, isChecked) => {
    if (isChecked) {
      setSelectedManagers(prev => [...prev, managerId]);
    } else {
      setSelectedManagers(prev => prev.filter(id => id !== managerId));
    }
  };

  const handleAssignManagersSubmit = async () => {
    if (!selectedBranchForManager) return;
    console.log("branch id: ", selectedBranchForManager._id)
    setManagersLoading(true);
    try {
      await assignManagers(
        selectedBranchForManager._id,
        selectedManagers
        );
      
      toast.success("Managers assigned successfully");
      setIsManagerModalOpen(false);
      fetchBranches(); // Refresh branches to show updated managers
      
    } catch (error) {
      toast.error("Failed to assign managers");
      console.log(error);
    } finally {
      setManagersLoading(false);
    }
  };

  const resetManagerModal = () => {
    setSelectedBranchForManager(null);
    setSelectedManagers([]);
    setIsManagerModalOpen(false);
  };

  const fetchBranches = async () => {
    try {
      const data = await getBranch();
      console.log("branches: ", data);
      setBranches(data || []);
    } catch (err) {
      toast.error("Failed to fetch branches");
      console.log(err);
      setBranches([]);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }

    if (!formData.code.trim()) {
      errors.code = 'Branch code is required';
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
      const branchData = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone || null,
        code: formData.code
      };

      if (editMode) {
        // Update existing branch
        await updateBranch(editingBranchId, branchData);
        toast.success("Branch Updated Successfully");
      } else {
        // Add new branch
        await addBranch(branchData);
        toast.success("Branch Added Successfully");
      }

      // Reset form and close modal
      resetForm();
      setIsModalOpen(false);
      fetchBranches();

    } catch (error) {
      const message = editMode ? "Failed to Update Branch" : "Failed to Add Branch";
      toast.error(message);
      console.log(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      code: ''
    });
    setFormErrors({});
    setEditMode(false);
    setEditingBranchId(null);
  };

  const handleAddBranch = () => {
    resetForm();
    setEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditBranch = (branch) => {
    setFormData({
      name: branch.name || '',
      address: branch.address || '',
      phone: branch.phone || '',
      code: branch.branchCode || ''
    });
    setEditMode(true);
    setEditingBranchId(branch._id);
    setIsModalOpen(true);
  };

  // Only allow admin users to access this component
  if (!user.access.isAdmin) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to view branches.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (branchLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Branches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading branches...</span>
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
              <Building className="h-5 w-5" />
              Branches ({branches.length})
            </CardTitle>
            
            <Dialog open={isModalOpen} onOpenChange={(open) => {
              setIsModalOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2" onClick={handleAddBranch}>
                  <Plus className="h-4 w-4" />
                  Add Branch
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editMode ? 'Edit Branch' : 'Add New Branch'}
                  </DialogTitle>
                  <DialogDescription>
                    {editMode 
                      ? 'Update the branch details below.'
                      : 'Fill in the branch details below. Name, address, and code are required.'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Branch Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter branch name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={formErrors.name ? 'border-red-500' : ''}
                      />
                      {formErrors.name && (
                        <p className="text-sm text-red-500">{formErrors.name}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="code">Branch Code</Label>
                      <Input
                        id="code"
                        placeholder="e.g., NYC001"
                        value={formData.code}
                        onChange={(e) => handleInputChange('code', e.target.value)}
                        className={formErrors.code ? 'border-red-500' : ''}
                      />
                      {formErrors.code && (
                        <p className="text-sm text-red-500">{formErrors.code}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter branch address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={formErrors.address ? 'border-red-500' : ''}
                      rows={3}
                    />
                    {formErrors.address && (
                      <p className="text-sm text-red-500">{formErrors.address}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      disabled={branchLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={branchLoading}
                      className="flex items-center gap-2"
                    >
                      {branchLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      {editMode ? 'Update Branch' : 'Add Branch'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {branches.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No branches found</h3>
              <p className="text-muted-foreground">There are no branches to display.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="hidden md:table-cell">Address</TableHead>
                    <TableHead className="hidden sm:table-cell">Phone</TableHead>
                    <TableHead className="hidden lg:table-cell">Managers</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.map((branch) => (
                    <TableRow key={branch._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold">{branch.name}</div>
                            {/* Show code on mobile when code column is hidden */}
                            <div className="text-xs text-muted-foreground md:hidden">
                              {branch.branchCode}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {branch.branchCode}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm max-w-xs truncate" title={branch.address}>
                            {branch.address}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden sm:table-cell">
                        {branch.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{branch.phone}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not provided</span>
                        )}
                      </TableCell>

                      <TableCell className="hidden lg:table-cell">
                        {branch.managers && branch.managers.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                              {branch.managers.length} Manager{branch.managers.length > 1 ? 's' : ''}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleAssignManager(branch)}
                            >
                              <Users className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => handleAssignManager(branch)}
                          >
                            <Users className="h-3 w-3 mr-1" />
                            Assign
                          </Button>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditBranch(branch)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {/* Show assign manager button on smaller screens where managers column is hidden */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 lg:hidden"
                            onClick={() => handleAssignManager(branch)}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Manager Dialog */}
      <Dialog open={isManagerModalOpen} onOpenChange={(open) => {
        setIsManagerModalOpen(open);
        if (!open) resetManagerModal();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Assign Managers to {selectedBranchForManager?.name}
            </DialogTitle>
            <DialogDescription>
              Select managers to assign to this branch. You can assign multiple managers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm font-medium">Available Managers:</div>
            
            {managers.length === 0 ? (
              <div className="text-center py-4">
                <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No managers available</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {managers.map((manager) => {
                  const isSelected = selectedManagers.includes(manager._id);
                  return (
                    <div
                      key={manager._id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50"
                    >
                      <Checkbox
                        id={`manager-${manager._id}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => 
                          handleManagerSelection(manager._id, checked)
                        }
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {isSelected ? (
                            <Check className="h-4 w-4 text-primary" />
                          ) : (
                            <Users className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <Label 
                          htmlFor={`manager-${manager._id}`}
                          className="font-medium cursor-pointer flex-1"
                        >
                          {manager.name}
                        </Label>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="border-t my-4"></div>
            
            <div className="text-sm text-muted-foreground">
              {selectedManagers.length === 0 
                ? "No managers selected" 
                : `${selectedManagers.length} manager${selectedManagers.length > 1 ? 's' : ''} selected`
              }
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsManagerModalOpen(false)}
                disabled={managersLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAssignManagersSubmit}
                disabled={managersLoading}
                className="flex items-center gap-2"
              >
                {managersLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Assign Managers
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BranchTable;