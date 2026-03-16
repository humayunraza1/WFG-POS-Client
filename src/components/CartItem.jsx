import React, { useState } from 'react';
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

// Cart Item Component
const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  //console.log("CartItem Rendered", item);
  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div className="flex-1">
        <h4 className="font-medium text-sm">{item.name}</h4>
        <p className="text-xs text-muted-foreground">{item.category}</p>
        {/* Show option name if available */}
        {item.option && (
          <p className="text-xs text-slate-500 font-medium">{item.option.name}</p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onUpdateQuantity(item.catId,item._id, Math.max(0, item.quantity - 1))}
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
          
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onUpdateQuantity(item.catId,item._id, item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          onClick={() => onRemove(item.catId,item._id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="w-20 text-right">
        <div className="text-xs text-muted-foreground">
          PKR {item.price.toLocaleString()} × {item.quantity}
        </div>
        <div className="font-medium text-sm">
          PKR. {(item.price * item.quantity).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default CartItem;