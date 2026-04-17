import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Search, ShoppingCart } from 'lucide-react';
import { useState, useMemo } from 'react';

const NewVariantsView = ({ selectedCategory, products, deals = [], onAddToCart, onViewChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [dealDialogOpen, setDealDialogOpen] = useState(false);
  const [dealSelections, setDealSelections] = useState({});

  const isDealsCategory = selectedCategory?._id === 'deals';

  const dealProducts = useMemo(() => {
    return (deals || []).map((deal) => {
      return {
        _id: deal._id,
        name: deal.name,
        imageUrl: deal.imageUrl,
        isDeal: true,
        dealRef: deal._id,
        dealItems: deal.items || [],
        pricingMode: deal.pricingMode || 'fixed',
        selectionGroups: (deal.selectionGroups || []).map((group) => ({
          ...group,
          items: (group.items || group.options || []).map((item) => ({
            ...item,
            productId: item.productId || item.product,
            categoryId: item.categoryId || item.category,
            optionId: item.optionId,
          })),
        })),
        dealCategoryId: deal.category?._id || null,
        options: [
          {
            _id: deal._id,
            name: 'Deal Price',
            price: Number(deal.price || 0),
          },
        ],
      };
    });
  }, [deals]);

  //console.log('VariantsView - selectedCategory:', selectedCategory);
  //console.log('VariantsView - products:', products);

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    const sourceProducts = isDealsCategory ? dealProducts : products;
    if (!sourceProducts || !Array.isArray(sourceProducts)) return [];

    let productList = sourceProducts;

    if (searchQuery) {
      productList = productList.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return productList.sort((a, b) => a.name.localeCompare(b.name));
  }, [products, dealProducts, searchQuery, isDealsCategory]);

  const handleAddToCart = (product, option) => {
    // Create the cart item structure expected by the POSDashboard
    const isDeal = Boolean(product.isDeal);
    const displayCategory = isDeal ? 'Deals' : selectedCategory.name;

    const cartItem = {
      _id: option._id,
      varID: option._id,
      name: product.name,
      price: option.price,
      category: displayCategory,
      quantity: 1,
      catID: isDeal ? product.dealCategoryId : selectedCategory._id,
      catId: isDeal ? product.dealCategoryId : selectedCategory._id,
      productId: isDeal ? `deal:${product.dealRef}` : product._id,
      prodID: isDeal ? product.dealRef : product._id,
      option: option,
      isDeal,
      dealRef: isDeal ? product.dealRef : null,
      pricingMode: isDeal ? product.pricingMode : 'fixed',
      dealItems: isDeal ? product.dealItems : null,
      cartKey: isDeal ? `deal:${product.dealRef}::${option._id}` : `${product._id}::${option._id}`,
    };
    onAddToCart(selectedCategory, cartItem);
  };

  const handleProductClick = (product) => {
    if (product.isDeal) {
      setSelectedDeal(product);
      setDealSelections({});
      setDealDialogOpen(true);
      return;
    }

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

  const getOptionKey = (option) => `${option.productId}:${option.optionId}`;

  const getEffectiveOptionPrice = (option, pricingMode) => {
    const basePrice = Number(option.optionPrice || 0);
    if (pricingMode === 'fixed') return basePrice;

    if (option.overridePrice !== null && typeof option.overridePrice !== 'undefined' && option.overridePrice !== '') {
      const parsedOverride = Number(option.overridePrice);
      return Number.isFinite(parsedOverride) ? parsedOverride : basePrice;
    }

    const parsedDelta = Number(option.priceDelta || 0);
    if (!Number.isFinite(parsedDelta)) return basePrice;

    return Math.max(0, basePrice + parsedDelta);
  };

  const handleDealOptionToggle = (groupIndex, group, option) => {
    setDealSelections((prev) => {
      const currentSelections = prev[groupIndex] || [];
      const key = getOptionKey(option);
      const exists = currentSelections.some((selection) => getOptionKey(selection) === key);

      let updatedSelections = [...currentSelections];
      if (exists) {
        updatedSelections = updatedSelections.filter((selection) => getOptionKey(selection) !== key);
      } else if (Number(group.maxSelect || 1) === 1) {
        updatedSelections = [option];
      } else if (updatedSelections.length < Number(group.maxSelect || 1)) {
        updatedSelections.push(option);
      }

      return {
        ...prev,
        [groupIndex]: updatedSelections,
      };
    });
  };

  const isDealSelectionValid = useMemo(() => {
    if (!selectedDeal) return false;

    return selectedDeal.selectionGroups.every((group, groupIndex) => {
      const selectedCount = (dealSelections[groupIndex] || []).length;
      const minSelect = Number(group.minSelect ?? (group.required ? 1 : 0));
      const maxSelect = Number(group.maxSelect ?? 1);
      return selectedCount >= minSelect && selectedCount <= maxSelect;
    });
  }, [selectedDeal, dealSelections]);

  const handleConfirmDealSelection = () => {
    if (!selectedDeal || !isDealSelectionValid) return;

    const selectedOptions = selectedDeal.selectionGroups.flatMap((group, groupIndex) =>
      (dealSelections[groupIndex] || []).map((option) => ({
        ...option,
        groupLabel: group.label,
        // Compose optionName as 'productName - optionName' if both exist, else fallback
        optionName: option.productName && option.optionName
          ? `${option.productName} - ${option.optionName}`
          : option.productName || option.optionName || '',
        effectivePrice: getEffectiveOptionPrice(option, selectedDeal.pricingMode),
      }))
    );

    const signature = selectedOptions
      .map((option) => `${option.productId}-${option.optionId}`)
      .sort()
      .join('_') || 'base';

    const totalDealPrice = selectedDeal.pricingMode === 'fixed'
      ? Number(selectedDeal.options?.[0]?.price || 0)
      : selectedOptions.reduce((sum, option) => sum + Number(option.effectivePrice || 0), 0);

    const option = {
      _id: `deal-${selectedDeal.dealRef}-${signature}`,
      name: `Deal (${selectedOptions.length} selections)`,
      price: Number(totalDealPrice || 0),
      dealSelections: selectedOptions,
    };

    handleAddToCart(selectedDeal, option);
    setDealDialogOpen(false);
    setSelectedDeal(null);
    setDealSelections({});
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
                          {product.isDeal && (
                            <p className="text-xs text-emerald-600 truncate">
                              {product.selectionGroups?.length || 0} selection groups
                            </p>
                          )}
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
                      handleProductClick(product);
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

      <Dialog open={dealDialogOpen} onOpenChange={setDealDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDeal?.name} - Configure Deal
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {selectedDeal?.selectionGroups?.map((group, groupIndex) => {
              const selectedCount = (dealSelections[groupIndex] || []).length;
              const minSelect = Number(group.minSelect ?? (group.required ? 1 : 0));
              const maxSelect = Number(group.maxSelect ?? 1);

              return (
                <div key={`${group.label}-${groupIndex}`} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{group.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {group.required ? 'Required' : 'Optional'} - select {minSelect} to {maxSelect}
                      </p>
                    </div>
                    <Badge variant="outline">{selectedCount}/{maxSelect}</Badge>
                  </div>

                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {(group.items || []).map((option) => {
                      const effectivePrice = getEffectiveOptionPrice(option, selectedDeal.pricingMode);
                      const key = getOptionKey(option);
                      const checked = (dealSelections[groupIndex] || []).some(
                        (selection) => getOptionKey(selection) === key
                      );
                      const atLimit = !checked && selectedCount >= maxSelect;

                      // If maxSelect is 1, render as radio group
                      if (maxSelect === 1) {
                        return (
                          <label
                            key={key}
                            className={`w-full flex items-center gap-2 border rounded-md px-3 py-2 transition-colors cursor-pointer ${checked ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                          >
                            <input
                              type="radio"
                              name={`deal-group-${groupIndex}`}
                              checked={checked}
                              onChange={() => handleDealOptionToggle(groupIndex, group, option)}
                              className="accent-primary mr-2"
                            />
                            <span className="flex-1 text-sm">{option.productName} - {option.optionName}</span>
                            <span className="text-xs text-muted-foreground">
                              {selectedDeal.pricingMode === 'dynamic'
                                ? `Rs. ${Number(effectivePrice || 0).toLocaleString()} (orig ${Number(option.optionPrice || 0).toLocaleString()})`
                                : `Rs. ${Number(option.optionPrice || 0).toLocaleString()}`}
                            </span>
                          </label>
                        );
                      }

                      // Otherwise, render as toggle button (checkbox style)
                      return (
                        <button
                          key={key}
                          type="button"
                          className={`w-full text-left border rounded-md px-3 py-2 transition-colors ${checked ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                          disabled={atLimit}
                          onClick={() => handleDealOptionToggle(groupIndex, group, option)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm">{option.productName} - {option.optionName}</span>
                            <span className="text-xs text-muted-foreground">
                              {selectedDeal.pricingMode === 'dynamic'
                                ? `Rs. ${Number(effectivePrice || 0).toLocaleString()} (orig ${Number(option.optionPrice || 0).toLocaleString()})`
                                : `Rs. ${Number(option.optionPrice || 0).toLocaleString()}`}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between border-t pt-3">
              <p className="font-semibold">
                Deal Price: PKR {Number(
                  selectedDeal?.pricingMode === 'fixed'
                    ? (selectedDeal?.options?.[0]?.price || 0)
                    : selectedDeal?.selectionGroups?.flatMap((group, index) =>
                        (dealSelections[index] || []).map((option) => getEffectiveOptionPrice(option, selectedDeal?.pricingMode))
                      ).reduce((sum, price) => sum + Number(price || 0), 0)
                ).toLocaleString()}
              </p>
              <Button onClick={handleConfirmDealSelection} disabled={!isDealSelectionValid}>
                Add Deal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewVariantsView;