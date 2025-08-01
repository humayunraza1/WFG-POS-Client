import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import {
  Package2,
  BarChart3,
  Receipt,
  Plus,
  Edit3,
  Power,
  Minus,
  Trash2,
  Menu,
  X,
  TrendingUp,
  PieChart,
  User,
  History,
  FileText,
  Settings
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SidebarMenuItem from './SidebarMenuItem';
import useOrders from '@/hooks/useOrders';
import useSidebarMenu from '../hooks/userSidebarMenu';
import { usePreferences } from '@/hooks/usePreferences';
import { useAuth } from '@/hooks/useAuth';
import {
  getManagerBadgeStyle,
  getManagerInitials,
  getAvatarBackgroundColor
} from '@/utils/managerColors';
import { toast } from 'sonner';

const Sidebar = ({ activeView, onViewChange, user, categories, onCloseRegister, onOpenRegister, registerData, isRegisterOpen }) => {
  const [expandedItems, setExpandedItems] = useState({
    variants: true
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { dailyStats, statsLoading } = useOrders();
  const { accountPrefs, businessPrefs, loading: prefsLoading, updatePreference } = usePreferences();
  const { user: authUser } = useAuth();

  const toggleExpanded = (key) => {
    if (key === 'variants') return;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const menuItems = useSidebarMenu(categories);

  const handlePreferenceChange = async (type, key, value) => {
    const result = await updatePreference(type, key, value);
    if (result.success) {
      toast.success(`Preference "${key}" updated`);
    } else {
      toast.error(`Failed to update "${key}"`);
    }
  };

  const PreferenceCheckbox = ({ type, prefKey, label, description, disabled = false }) => {
    const prefs = type === 'account' ? accountPrefs : businessPrefs;
    const value = prefs?.[prefKey] || false;

    const handleCheckboxChange = (checked) => {
      if (disabled || prefsLoading) return;
      handlePreferenceChange(type, prefKey, checked);
    };

    return (
      <div className="flex items-center justify-between space-x-2">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">{label}</Label>
        </div>
        <Checkbox
          checked={value}
          disabled={disabled || prefsLoading}
          onCheckedChange={handleCheckboxChange}
          className={`
            ${value 
              ? 'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 data-[state=checked]:text-white' 
              : 'data-[state=unchecked]:bg-red-50 data-[state=unchecked]:border-red-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            w-5 h-5
          `}
        />
      </div>
    );
  };

  return (
    <Card className="w-64 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto">
      <CardHeader>
        <CardTitle className="text-lg">Menu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <SidebarMenuItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              children={item.children}
              isExpanded={expandedItems[item.key]}
              onToggle={() => toggleExpanded(item.key)}
              onClick={(subItem) => onViewChange(item.key, subItem)}
              isActive={activeView === item.key}
              hasSubItems={item.hasSubItems}
            />
          ))}
        </div>

        <Separator className="my-4" />

        {/* Settings Dialog */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>
                Manage your account and business preferences.
              </DialogDescription>
            </DialogHeader>

            {prefsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading preferences...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Account Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Account Preferences</h3>
                  <div className="space-y-4">
                    {accountPrefs && Object.entries(accountPrefs).map(([key]) => (
                      <PreferenceCheckbox
                        key={key}
                        type="account"
                        prefKey={key}
                        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      />
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Business Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Business Preferences</h3>
                  <div className="space-y-4">
                    {businessPrefs && Object.entries(businessPrefs).map(([key]) => (
                      <PreferenceCheckbox
                        key={key}
                        type="business"
                        prefKey={key}
                        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        disabled={!authUser?.access?.isAdmin}
                      />
                    ))}
                    {!authUser?.access?.isAdmin && (
                      <p className="text-xs text-muted-foreground italic">
                        Admin access required to modify business preferences
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Separator className="my-4" />

        {isRegisterOpen && registerData?.manager && (
          <>
            <Card 
              className="border-0 h-15"
              style={{
                backgroundColor: getManagerBadgeStyle(registerData.manager).backgroundColor
              }}
            >
              <CardContent className="p-2 h-full flex items-center">
                <div className="flex items-center gap-2 w-full">
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarFallback 
                      className="text-white font-semibold text-xs"
                      style={{
                        backgroundColor: getAvatarBackgroundColor(registerData.manager)
                      }}
                    >
                      {getManagerInitials(registerData.manager)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white/80 leading-tight truncate">
                      Current Manager
                    </p>
                    <p className="text-white font-semibold text-xs leading-tight truncate">
                      {registerData.manager}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Separator className="my-4" />
          </>
        )}

        {!user.access.isManager && (!isRegisterOpen ? (
          <Button
            variant="default"
            className="w-full"
            onClick={onOpenRegister}
          >
            <Power className="mr-2 h-4 w-4" />
            Open Register
          </Button>
        ) : (
          <Button
            variant="destructive"
            className="w-full"
            onClick={onCloseRegister}
          >
            <Power className="mr-2 h-4 w-4" />
            Close Register
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default Sidebar;
