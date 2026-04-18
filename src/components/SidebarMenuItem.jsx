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
  X,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PartnershipSlashBadge = ({ text }) => (
  <span className="group inline-flex items-center gap-1.5">
    <span className="relative inline-flex h-4 w-5 items-center justify-center">
      <Sparkles className="partnership-twinkle absolute h-3.5 w-3.5 text-amber-500" />
      <Sparkles className="partnership-twinkle-delayed absolute h-2.5 w-2.5 translate-x-[7px] -translate-y-[5px] text-cyan-400/90" />
      <Sparkles className="partnership-hover-flake absolute left-[1px] top-[-7px] h-2.5 w-2.5 text-sky-300/80" />
      <Sparkles className="partnership-hover-flake partnership-hover-flake-delayed absolute left-[9px] top-[-9px] h-2 w-2 text-amber-300/80" />
    </span>
    <span className="relative inline-block">
      <span className="relative z-10 font-medium text-foreground">{text}</span>
    </span>
  </span>
);

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
                {child?.isPartnership ? (
                  <PartnershipSlashBadge text={child.name || child} />
                ) : (
                  child.name || child
                )}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };
  export default SidebarMenuItem; 