import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Search, ShoppingCart } from 'lucide-react';
import { useState, useMemo } from 'react';

const VariantsView = ({ selectedCategory, products, onAddToCart, onViewChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  console.log('VariantsView - selectedCategory:', selectedCategory);
  console.log('VariantsView - products:', products);

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];

    let productList = products;

    if (searchQuery) {
      productList = productList.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return productList.sort((a, b) => a.name.localeCompare(b.name));
  }, [products, searchQuery]);

  const handleAddToCart = (product, option) => {
    // Create the cart item structure expected by the POSDashboard
    const cartItem = {
      _id: option._id,
      name: product.name,
      price: option.price,
      category: selectedCategory.name,
      quantity: 1,
      catID: selectedCategory._id,
      prodID: product._id,
      option: option
    };
    onAddToCart(selectedCategory, cartItem);
  };

  const handleProductClick = (product) => {
    if (product.options && product.options.length > 1) {
      setSelectedProduct(product);
      setDialogOpen(true);
    } else if (product.options && product.options.length === 1) {
      handleAddToCart(product, product.options[0]);
    }
  };

  const handleOptionSelect = (option) => {
    if (selectedProduct) {
      handleAddToCart(selectedProduct, option);
      setDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  const ProductCard = ({ product }) => (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden group hover:scale-105 w-[150px] flex-shrink-0 flex flex-col"
      onClick={() => handleProductClick(product)}
    >
      <div className="w-full h-[100px] overflow-hidden flex-shrink-0">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-2 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="font-semibold text-[13px] leading-tight mb-1 break-words">
            {product.name}
          </h3>
          
          {/* Show option info based on number of options */}
          {product.options && product.options.length > 0 ? (
            product.options.length === 1 ? (
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground">{product.options[0].name}</p>
                <Badge variant="outline" className="text-[10px] px-1 py-0.5">
                  PKR {product.options[0].price.toLocaleString()}
                </Badge>
              </div>
            ) : (
              <Badge variant="secondary" className="text-[10px] px-1 py-0.5">
                {product.options.length} options
              </Badge>
            )
          ) : (
            <p className="text-[10px] text-muted-foreground">No options available</p>
          )}
        </div>
        
        {/* Add to cart button for single option products */}
        {product.options && product.options.length === 1 && (
          <div className="mt-auto pt-2 flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-primary hover:text-primary-foreground"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product, product.options[0]);
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
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
              Back to Categories
            </Button>
            <Badge variant="secondary" className="text-sm">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <div>
            <CardTitle className="text-xl mb-2">
              {selectedCategory ? selectedCategory.name : 'Products'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Select a product to add to cart
            </p>
          </div>

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

        <CardContent className="flex-1 px-4 overflow-y-auto">
          <div className="flex flex-wrap gap-3 pr-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className="w-full text-center text-muted-foreground py-8">
                <ShoppingCart className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No products found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Options Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <img
                src={selectedProduct?.imageUrl}
                alt={selectedProduct?.name}
                className="w-8 h-8 rounded object-cover"
              />
              {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Choose an option to add to cart:
            </p>
            {selectedProduct?.options?.map((option, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => handleOptionSelect(option)}
              >
                <div>
                  <p className="font-medium">{option.name}</p>
                  <p className="text-sm text-muted-foreground">
                    PKR {option.price.toLocaleString()}
                  </p>
                </div>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VariantsView;