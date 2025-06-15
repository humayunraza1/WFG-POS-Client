import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, BarChart3, TrendingUp, Calendar } from 'lucide-react';
import useProducts from '@/hooks/useProducts';
import useProductAnalytics from '@/hooks/useProductAnalytics';
import ProductSalesChart from './ProductSalesChart';
import VariantBreakdown from './VariantBreakdown';

const ProductAnalytics = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [viewType, setViewType] = useState('product'); // 'product' or 'variant'
  
  const { products } = useProducts();
  const { 
    productSales, 
    variantSales, 
    dailySales, 
    loading, 
    error, 
    fetchProductAnalytics,
    fetchVariantAnalytics 
  } = useProductAnalytics();

  useEffect(() => {
    if (selectedProduct) {
      if (viewType === 'product') {
        fetchProductAnalytics(selectedProduct);
      } else if (selectedVariant) {
        fetchVariantAnalytics(selectedVariant);
      }
    }
  }, [selectedProduct, selectedVariant, viewType]);

  const handleProductChange = (productId) => {
    setSelectedProduct(productId);
    setSelectedVariant(null); // Reset variant selection
    setViewType('product');
  };

  const handleVariantChange = (variantId) => {
    setSelectedVariant(variantId);
    setViewType('variant');
  };

  const selectedProductData = products?.find(p => p._id === selectedProduct);
  const availableVariants = selectedProductData?.variants || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Product/Variant Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Product Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Select Product:</span>
              <Select value={selectedProduct || ""} onValueChange={handleProductChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProduct && availableVariants.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Or Variant:</span>
                <Select value={selectedVariant || ""} onValueChange={handleVariantChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Choose a variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVariants.map((variant) => (
                      <SelectItem key={variant._id} value={variant._id}>
                        {variant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(selectedProduct || selectedVariant) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSelectedProduct(null);
                  setSelectedVariant(null);
                }}
              >
                Clear Selection
              </Button>
            )}
          </div>

          {/* View Type Toggle */}
          {selectedProduct && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">View:</span>
              <div className="flex gap-1">
                <Button
                  variant={viewType === 'product' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewType('product')}
                >
                  Product Overview
                </Button>
                <Button
                  variant={viewType === 'variant' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewType('variant')}
                  disabled={!availableVariants.length}
                >
                  Variant Breakdown
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Content */}
      {selectedProduct && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Performance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Sales Performance
                </span>
                <Badge variant="outline">
                  {viewType === 'product' ? 'Product View' : 'Variant View'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {viewType === 'product' && productSales ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {productSales.totalQuantity}
                      </div>
                      <div className="text-sm text-muted-foreground">Units Sold</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        PKR {productSales.totalRevenue?.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Revenue</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {productSales.orderCount}
                      </div>
                      <div className="text-sm text-muted-foreground">Orders</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        PKR {productSales.avgOrderValue?.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Order</div>
                    </div>
                  </div>
                </div>
              ) : viewType === 'variant' && variantSales ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {variantSales.totalQuantity}
                      </div>
                      <div className="text-sm text-muted-foreground">Units Sold</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        PKR {variantSales.totalRevenue?.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Revenue</div>
                    </div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      PKR {variantSales.avgPrice?.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Average Price</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No sales data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Sales Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Daily Sales Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductSalesChart 
                data={dailySales} 
                type={viewType}
                productName={selectedProductData?.name}
                variantName={selectedVariant ? availableVariants.find(v => v._id === selectedVariant)?.name : null}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Variant Breakdown - Only show for product view */}
      {selectedProduct && viewType === 'product' && availableVariants.length > 0 && (
        <VariantBreakdown 
          productId={selectedProduct}
          productName={selectedProductData?.name}
          variants={availableVariants}
        />
      )}

      {/* No Selection State */}
      {!selectedProduct && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Product</h3>
            <p className="text-muted-foreground max-w-md">
              Choose a product from the dropdown above to view detailed analytics including sales performance, daily trends, and variant breakdowns.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductAnalytics;