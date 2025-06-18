import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Search, ShoppingCart } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

const VariantsView = ({ category, products, onAddToCart, onViewChange }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter variants based on search query
  const filteredVariants = useMemo(() => {
    if (!searchQuery) return products.variants || [];
    return products.variants?.filter(variant =>
      variant.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  }, [products.variants, searchQuery]);

  // Separate variants into normal and ice cream variants
  const { normalVariants, iceCreamVariants } = useMemo(() => {
    const normal = filteredVariants.filter(variant => 
      !variant.name.toLowerCase().includes('+ ice cream')
    );
    const iceCream = filteredVariants.filter(variant => 
      variant.name.toLowerCase().includes('+ ice cream')
    );
    return { normalVariants: normal, iceCreamVariants: iceCream };
  }, [filteredVariants]);

  const handleAddToCart = (product) => {
    onAddToCart(category, product);
  };

  const VariantCard = ({ product }) => (
    <Card
      key={product.customId}
      className="cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden group hover:scale-105 w-[150px] flex-shrink-0 flex flex-col"
      onClick={() => handleAddToCart(product)}
    >
      <div className="w-full h-[100px] overflow-hidden flex-shrink-0">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-2 flex flex-col justify-between flex-grow min-h-[50px]">
        <h3 className="font-semibold text-[13px] leading-tight mb-2 break-words">
          {product.name}
        </h3>
        <div className="flex justify-between items-center mt-auto">
          <Badge variant="outline" className="text-[12px] px-1 py-0.5">
            PKR {product.price.toLocaleString()}
          </Badge>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-5 w-5 p-0 hover:bg-primary hover:text-primary-foreground"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(product);
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const VariantGrid = ({ variants, emptyMessage }) => (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-wrap gap-3 pr-4">
        {variants.map((product) => (
          <VariantCard key={product.customId} product={product} />
        ))}
        {variants.length === 0 && (
          <div className="w-full text-center text-muted-foreground py-8">
            <ShoppingCart className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card className="h-[76vh] flex flex-col overflow-hidden">
      <CardHeader className="flex flex-col gap-3 flex-shrink-0 pb-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange('products')}
            className="gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
          <Badge variant="secondary" className="text-sm">
            {filteredVariants.length} variants
          </Badge>
        </div>
        
        <div>
          <CardTitle className="text-xl mb-2">{products.name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select items to add to your cart
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search variants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-4 overflow-hidden">
        {iceCreamVariants.length > 0 ? (
          <Tabs defaultValue="normal" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-3 flex-shrink-0">
              <TabsTrigger value="normal" className="text-sm">
                Normal ({normalVariants.length})
              </TabsTrigger>
              <TabsTrigger value="ice-cream" className="text-sm">
                With Ice Cream ({iceCreamVariants.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="normal" className="flex-1 mt-0 overflow-hidden">
              <VariantGrid 
                variants={normalVariants} 
                emptyMessage={searchQuery ? "No normal variants found matching your search" : "No normal variants available"}
              />
            </TabsContent>
            
            <TabsContent value="ice-cream" className="flex-1 mt-0 overflow-hidden">
              <VariantGrid 
                variants={iceCreamVariants} 
                emptyMessage={searchQuery ? "No ice cream variants found matching your search" : "No ice cream variants available"}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="h-full overflow-hidden">
            <VariantGrid 
              variants={normalVariants} 
              emptyMessage={searchQuery ? "No variants found matching your search" : "No variants available"}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VariantsView;