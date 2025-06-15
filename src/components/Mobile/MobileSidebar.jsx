import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { 
  ChevronDown, 
  ChevronRight, 
  DollarSign, 
  ShoppingCart, 
  Calculator,
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
  LogOut
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SidebarMenuItem from '../SidebarMenuItem';

// Mobile Sidebar Component
const MobileSidebar = ({ 
  isOpen, 
  onClose, 
  activeView, 
  onViewChange, 
  products, 
  onCloseRegister, 
  registerData, 
  isRegisterOpen,
  user,
  onLogout 
}) => {
  const [expandedItems, setExpandedItems] = useState({});
  
  // Function to get manager badge style (same as in desktop Sidebar)
  const getManagerBadgeStyle = (manager) => {
    const styles = {
      'Hamza': { backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' }, // Red
      'Wajeeh': { backgroundColor: '#22c55e', color: 'white', borderColor: '#22c55e' }, // Green
      'Talal': { backgroundColor: '#3b82f6', color: 'white', borderColor: '#3b82f6' } // Blue
    };
    return styles[manager] || {};
  };

  // Function to get manager initials for avatar
  const getManagerInitials = (manager) => {
    if (!manager) return 'M';
    return manager.charAt(0).toUpperCase();
  };

  // Function to get lighter avatar background color
  const getAvatarBackgroundColor = (manager) => {
    const baseColors = {
      'Hamza': '#f87171', // Lighter red
      'Wajeeh': '#4ade80', // Lighter green
      'Talal': '#60a5fa' // Lighter blue
    };
    return baseColors[manager] || '#94a3b8'; // Default lighter gray
  };
  
  const toggleExpanded = (key) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const menuItems = [
    {
      key: 'variants',
      icon: Package2,
      label: 'Products',
      children: products.map(product => ({
        id: product._id,
        name: product.name,
        variants: product.variants
      })),
      hasSubItems: true
    },
    {
      key: 'orders',
      icon: Receipt,
      label: "Orders"
    },
    {
      key: 'summary',
      icon: History,
      label: 'Register History'
    },
    {
      key: 'orders-history',
      icon: FileText,
      label: 'Orders History'
    },
    {
      key: 'expenses',
      icon: Receipt,
      label: 'Expenses'
    },
    {
      key: 'add-product',
      icon: Plus,
      label: 'Add Product'
    },
    {
      key: 'edit-product',
      icon: Edit3,
      label: 'Edit Product'
    }
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full sm:w-80 p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full px-6 pb-6">
          {/* User Card - Show at top in mobile */}
          {user && (
            <>
              <Card className="border-0 h-15 bg-muted/50 mb-4">
                <CardContent className="p-3 h-full flex items-center">
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback 
                        className="bg-primary text-primary-foreground font-semibold text-sm"
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-muted-foreground leading-tight truncate">
                        Logged in as
                      </p>
                      <p className="font-semibold text-sm leading-tight truncate">
                        {user.username}
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onLogout();
                        onClose();
                      }}
                      className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground flex-shrink-0"
                      title="Logout"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Scrollable Menu Items */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <SidebarMenuItem
                    key={item.key}
                    icon={item.icon}
                    label={item.label}
                    children={item.children}
                    isExpanded={expandedItems[item.key]}
                    onToggle={() => toggleExpanded(item.key)}
                    onClick={(subItem) => {
                      if (item.key === 'analysis' && subItem) {
                        onViewChange('analysis', subItem.key);
                      } else {
                        onViewChange(item.key, subItem);
                      }
                      onClose();
                    }}
                    isActive={activeView === item.key}
                    hasSubItems={item.hasSubItems}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Bottom Section */}
          <div className="mt-4 space-y-4">
            <Separator />

            {/* Manager Card - Only show when register is open */}
            {isRegisterOpen && registerData?.manager && (
              <>
                <Card 
                  className="border-0"
                  style={{
                    backgroundColor: getManagerBadgeStyle(registerData.manager).backgroundColor
                  }}
                >
                  <CardContent className="p-3 h-full flex items-center">
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback 
                          className="text-white font-semibold text-sm"
                          style={{
                            backgroundColor: getAvatarBackgroundColor(registerData.manager)
                          }}
                        >
                          {getManagerInitials(registerData.manager)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/80 leading-tight truncate">
                          Current Manager
                        </p>
                        <p className="text-white font-semibold text-sm leading-tight truncate">
                          {registerData.manager}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            
            {/* Only show Close Register button if register is open */}
            {isRegisterOpen && (
              <Button 
                variant="destructive" 
                className="w-full" 
                size="lg"
                onClick={() => {
                  onCloseRegister();
                  onClose();
                }}
              >
                <Power className="mr-2 h-4 w-4" />
                Close Register
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;