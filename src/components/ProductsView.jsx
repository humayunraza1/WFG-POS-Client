import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
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
  Search
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProductsView = ({products, onViewChange}) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter products based on search query
    const filteredProducts = useMemo(() => {
        if (!searchQuery) return products || [];
        return products?.filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) || [];
    }, [products, searchQuery]);
    
    return (
        <Card className="h-[76vh]">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Products</span>
                    <Badge variant="secondary">{filteredProducts.length} categories</Badge>
                </CardTitle>
                
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </CardHeader>
            <CardContent className="h-full pb-6">
                <ScrollArea className="h-full">
                    <div className="grid grid-cols-6 gap-4 pr-4 overflow-hidden">
                        {filteredProducts?.map((product, index) => (
                            <Card 
                                key={product.customId} 
                                className="cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden group hover:scale-105 w-[150px] flex-shrink-0"
                                onClick={() => onViewChange('variants', product)}
                            >
                                <div className="w-full h-2/3 overflow-hidden">
                                    <img 
                                        src={product.imageUrl} 
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <CardContent className="p-2 h-1/3 flex flex-col justify-center items-center text-center">
                                    <h3 className="font-semibold text-[13px] leading-tight line-clamp-1 mb-1 overflow-hidden text-ellipsis whitespace-nowrap w-full">
                                        {product.name}
                                    </h3>
                                    <Badge variant="outline" className="text-[10px]">
                                        {product.variants?.length || 0} items
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                        {filteredProducts.length === 0 && (
                            <div className="col-span-6 text-center py-8">
                                <Package2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">
                                    {searchQuery ? 'No products found matching your search' : 'No products available'}
                                </p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default ProductsView;