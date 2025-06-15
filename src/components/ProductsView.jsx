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

const ProductsView = ({products,onViewChange}) => {
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {products?.map((product,index) => (
              <Card 
                key={product.customId} 
                className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden w-[180px]"
                onClick={() => onViewChange('variants', product)}
              >
                <div className="w-full h-32 overflow-hidden">
                  <img 
                    src={product.imageUrl} 
                    alt={product.label}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-center leading-tight">{product.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  export default ProductsView;