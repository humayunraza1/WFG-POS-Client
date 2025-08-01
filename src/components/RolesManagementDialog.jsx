import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  Settings, 
  Edit, 
  Check, 
  X, 
  Plus, 
  Loader2,
  Shield 
} from 'lucide-react';
import { toast } from 'sonner';
import useRole from '@/hooks/useRole';
import getRoles from '@/utils/getRoles';

const RolesManagementDialog = ({ onRolesUpdated }) => {
  const { addRole, editRole, loading } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [rolesLoading, setRolesLoading] = useState(false);

  // Fetch roles when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  const fetchRoles = async () => {
    setRolesLoading(true);
    try {
      const rolesData = await getRoles();
      setRoles(rolesData || []);
    } catch (error) {
      toast.error('Failed to fetch roles');
      console.error(error);
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  };

  const handleEditClick = (role) => {
    if (role.name === 'admin' || role.name === 'manager') {
      toast.error('Cannot edit system roles');
      return;
    }
    setEditingId(role._id);
    setEditingName(role.name);
  };

  const handleSaveEdit = async () => {
    if (!editingName.trim()) {
      toast.error('Role name cannot be empty');
      return;
    }

    try {
      await editRole(editingId, editingName.trim());
      await fetchRoles(); // Refresh the roles list
      setEditingId(null);
      setEditingName('');
      // Notify parent component that roles were updated
      if (onRolesUpdated) {
        onRolesUpdated();
      }
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleAddNew = async () => {
    if (!newRoleName.trim()) {
      toast.error('Role name cannot be empty');
      return;
    }

    try {
      await addRole(newRoleName.trim());
      await fetchRoles(); // Refresh the roles list
      setIsAddingNew(false);
      setNewRoleName('');
      // Notify parent component that roles were updated
      if (onRolesUpdated) {
        onRolesUpdated();
      }
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleCancelAdd = () => {
    setIsAddingNew(false);
    setNewRoleName('');
  };

  const getRoleBadgeColor = (roleName) => {
    const roleColors = {
      admin: 'bg-red-100 text-red-800 border-red-200',
      manager: 'bg-purple-100 text-purple-800 border-purple-200',
      cashier: 'bg-blue-100 text-blue-800 border-blue-200',
      chef: 'bg-orange-100 text-orange-800 border-orange-200',
      employee: 'bg-gray-100 text-gray-800 border-gray-200',
      cleaner: 'bg-green-100 text-green-800 border-green-200',
      waiter: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return roleColors[roleName] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const isSystemRole = (roleName) => {
    return roleName === 'admin' || roleName === 'manager';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Manage Roles
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manage Roles
          </DialogTitle>
          <DialogDescription>
            Add, edit, or manage employee roles. System roles (Admin, Manager) cannot be modified.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {rolesLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading roles...</span>
            </div>
          ) : (
            <>
              {/* Existing Roles */}
              <div className="space-y-3">
                {roles.map((role) => (
                  <div 
                    key={role._id} 
                    className="flex items-center justify-between p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {editingId === role._id ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="w-40"
                          placeholder="Role name"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                        />
                      ) : (
                        <>
                          <Badge 
                            variant="outline" 
                            className={getRoleBadgeColor(role.name)}
                          >
                            {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                          </Badge>
                          {isSystemRole(role.name) && (
                            <span className="text-xs text-muted-foreground bg-yellow-50 px-2 py-1 rounded">
                              System Role
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {editingId === role._id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={loading}
                            className="h-8 w-8 p-0"
                          >
                            {loading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            disabled={loading}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClick(role)}
                          disabled={isSystemRole(role.name) || loading}
                          className="h-8 w-8 p-0"
                          title={isSystemRole(role.name) ? 'Cannot edit system roles' : 'Edit role'}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Role Section */}
              <div className="border-t pt-4">
                {isAddingNew ? (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 border-blue-200">
                    <Input
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      className="w-40 bg-white"
                      placeholder="Enter role name"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddNew();
                        if (e.key === 'Escape') handleCancelAdd();
                      }}
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleAddNew}
                        disabled={loading}
                        className="h-8 w-8 p-0"
                      >
                        {loading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelAdd}
                        disabled={loading}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingNew(true)}
                    disabled={loading || editingId !== null}
                    className="w-full flex items-center gap-2 border-dashed"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Role
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer with info */}
        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground">
            System roles (Admin, Manager) are protected and cannot be edited or deleted.
            Press Enter to save or Escape to cancel when editing.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RolesManagementDialog;