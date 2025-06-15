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

// Sidebar Menu Item Component
const SidebarMenuItem = ({ icon: Icon, label, children, isExpanded, onToggle, onClick, isActive }) => {
    const hasChildren = children && children.length > 0;
    return (
      <div className="space-y-1">
        <Button
          variant={isActive && !hasChildren ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={hasChildren ? onToggle : onClick}
        >
          <Icon className="mr-2 h-4 w-4" />
          {label}
          {hasChildren && (
            <div className="ml-auto">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          )}
        </Button>
        
        {hasChildren && isExpanded && (
          <div className="ml-6 space-y-1">
              {children.map((child, index) => (
              <Button
                key={child.id || index}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => onClick && onClick(child)}
              >
                {child.name || child}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };
  export default SidebarMenuItem; 