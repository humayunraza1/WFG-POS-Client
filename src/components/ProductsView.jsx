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
import { Sparkles } from 'lucide-react';

const ProductsView = ({ categories, onViewChange }) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter categories based on search query
    const filteredCategories = useMemo(() => {
        if (!searchQuery) return categories || [];
        return categories?.filter(category =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) || [];
    }, [categories, searchQuery]);

    //console.log("products view categories: ", filteredCategories);

    const CategoryBox = ({ category }) => (
        <div 
            className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all duration-200 bg-white hover:bg-gray-50 active:scale-95 flex flex-col h-full"
            onClick={() => onViewChange('variants', category)}
        >
            <div className="w-full aspect-square mb-3 overflow-hidden rounded-md bg-gray-100 flex-shrink-0">
                <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
            </div>
            
            <div className="flex flex-col flex-grow items-center text-center">
                <h3 className="font-medium text-sm leading-tight mb-2 text-gray-900 line-clamp-2">
                    {category.name}
                </h3>
                {category.isPartnership && (
                    <div className="mb-2 inline-flex -rotate-2 items-center gap-1 overflow-hidden rounded-sm border border-amber-300 bg-gradient-to-r from-amber-100 via-rose-50 to-cyan-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-900 shadow-sm">
                        <Sparkles className="h-3 w-3" />
                        <span className="skew-x-[-10deg]">Partnership</span>
                    </div>
                )}
                
                <div className="mt-auto">
                    <Badge variant="outline" className="text-xs px-2 py-1">
                        Category
                    </Badge>
                </div>
            </div>
        </div>
    );

    return (
        <Card className="min-h-[76vh] flex flex-col overflow-hidden">
            <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center justify-between">
                    <span>Product Categories</span>
                    <Badge variant="secondary">{filteredCategories.length} categories</Badge>
                </CardTitle>
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
                {filteredCategories.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pb-4">
                        {filteredCategories.map((category) => (
                            <CategoryBox key={category._id} category={category} />
                        ))}
                    </div>
                ) : (
                    <div className="w-full text-center text-muted-foreground py-8">
                        <Package2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>
                            {searchQuery ? 'No categories found matching your search' : 'No categories available'}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ProductsView;