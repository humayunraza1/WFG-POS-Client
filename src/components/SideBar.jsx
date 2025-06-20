import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  FileText
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SidebarMenuItem from './SidebarMenuItem';
import useOrders from '@/hooks/useOrders';

const Sidebar = ({ activeView, onViewChange, products, onCloseRegister, onOpenRegister, registerData, isRegisterOpen }) => {
  const [expandedItems, setExpandedItems] = useState({
    variants: true // Always expand products menu by default
  });
  const { dailyStats, statsLoading } = useOrders();

  // Function to get manager badge style (same as in RegisterSessionTable)
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
    // Don't allow collapsing the products menu
    if (key === 'variants') return;
    
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
      children: products,
      hasSubItems: true
    },
    {
      key: 'orders',
      icon: Receipt,
      label: "Orders"
    },
    {
      key: 'expenses',
      icon: Receipt,
      label: 'Expenses'
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
      key: 'reports',
      icon: BarChart3,
      label: 'Reports'
    },
    // {
    //   key: 'analysis',
    //   icon: TrendingUp,
    //   label: 'Analysis'
    // },
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
              onClick={(subItem) => { 
                if (item.key === 'analysis' && subItem) {
                  onViewChange('analysis', subItem.key);
                } else {
                  onViewChange(item.key, subItem);
                }
              }}
              isActive={activeView === item.key}
              hasSubItems={item.hasSubItems}
            />
          ))}
        </div>

        <Separator className="my-4" />

        {/* Manager Card - Only show when register is open */}
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

        {/* Register Control Button - Shows Open when closed, Close when open */}
        {!isRegisterOpen ? (
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
        )}
      </CardContent>
    </Card>
  );
};

export default Sidebar;