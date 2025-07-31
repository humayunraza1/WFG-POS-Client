import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Search, ShoppingCart } from 'lucide-react';
import { useState, useMemo } from 'react';

const NewVariantsView = ({ selectedCategory, products, onAddToCart, onViewChange }) => {
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

  const ProductBox = ({ product }) => (
    <div 
      className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all duration-200 bg-white hover:bg-gray-50 active:scale-95 flex flex-col h-full"
      onClick={() => handleProductClick(product)}
    >
      <div className="w-full aspect-square mb-3 overflow-hidden rounded-md bg-gray-100 flex-shrink-0">
        <img
          src={product.imageUrl||"https://png.pngtree.com/png-vector/20221125/ourmid/pngtree-no-image-available-icon-flatvector-illustration-thumbnail-graphic-illustration-vector-png-image_40966590.jpg"}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="flex flex-col flex-grow">
        <h3 className="font-medium text-sm leading-tight mb-2 text-gray-900 line-clamp-2">
          {product.name}
        </h3>
        
        <div className="mt-auto">
          {/* Show option info based on number of options */}
          {product.options && product.options.length > 0 ? (
            product.options.length === 1 ? (
              <div className="space-y-1">
                <p className="text-xs text-gray-500 truncate">{product.options[0].name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">
                    PKR {product.options[0].price.toLocaleString()}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 hover:bg-primary hover:text-primary-foreground rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product, product.options[0]);
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  {product.options.length} options
                </Badge>
              </div>
            )
          ) : (
            <p className="text-xs text-gray-400 text-center">No options available</p>
          )}
        </div>
      </div>
    </div>
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
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pb-4">
              {filteredProducts.map((product) => (
                <ProductBox key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="w-full text-center text-muted-foreground py-8">
              <ShoppingCart className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No products found</p>
            </div>
          )}
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

export default NewVariantsView;