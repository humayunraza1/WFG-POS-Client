import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  X
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mobile Sidebar Component
const MobileSidebar = ({ isOpen, onClose, activeView, onViewChange, products, onCloseRegister }) => {
    const [expandedItems, setExpandedItems] = useState({});
    
    const toggleExpanded = (key) => {
      setExpandedItems(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    };
    
    const menuItems = [
      {
        key: 'products',
        icon: Package2,
        label: 'Products',
        children: Object.keys(products),
        hasSubItems: true
      },
      {
        key: 'summary',
        icon: BarChart3,
        label: 'Summary',
        children: ['All Orders', 'Weekly', 'Monthly', 'Quarterly', 'Yearly']
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
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="fixed left-0 top-0 h-full w-64 bg-background border-r">
          <Card className="h-full rounded-none border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Menu</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              <ScrollArea className="h-96">
                {menuItems.map((item) => (
                  <SidebarMenuItem
                    key={item.key}
                    icon={item.icon}
                    label={item.label}
                    children={item.children}
                    isExpanded={expandedItems[item.key]}
                    onToggle={() => toggleExpanded(item.key)}
                    onClick={(subItem) => {
                      onViewChange(item.key, subItem);
                      onClose();
                    }}
                    isActive={activeView === item.key}
                  />
                ))}
              </ScrollArea>
              
              <Separator className="my-4" />
              
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={() => {
                  onCloseRegister();
                  onClose();
                }}
              >
                <Power className="mr-2 h-4 w-4" />
                Close Register
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  export default MobileSidebar;