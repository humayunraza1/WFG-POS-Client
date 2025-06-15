import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Award, Package, TrendingUp, DollarSign, ChevronRight, ArrowLeft } from 'lucide-react';
import useAnalytics from '@/hooks/useAnalytics';
import useProductVariants from '@/hooks/useProductVariants';
import AnalyticsFilters from './AnalyticsFilter';

const TopSellingProducts = () => {
  const [filters, setFilters] = useState({
    period: 'all',
    dateRange: { start: null, end: null },
    sessionId: null
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showVariants, setShowVariants] = useState(false);

  const { topProducts, loading, error, fetchTopSellers } = useAnalytics();
  const { productVariants, loading: variantsLoading, error: variantsError, fetchProductVariants } = useProductVariants();

  useEffect(() => {
    fetchTopSellers(filters);
  }, [filters]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    // Reset product selection when filters change
    setSelectedProduct(null);
    setShowVariants(false);
  };

  const handleProductClick = async (product) => {
    setSelectedProduct(product);
    setShowVariants(true);
    // Fetch variants for this product with current filters
    await fetchProductVariants(product._id, filters);
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
    setShowVariants(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading top sellers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnalyticsFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showVariants ? (
                  <>
                    <Package className="h-5 w-5 text-blue-500" />
                    {selectedProduct?.name} - Top Variants
                  </>
                ) : (
                  <>
                    <Award className="h-5 w-5 text-yellow-500" />
                    Top Selling Products
                  </>
                )}
              </div>
              {showVariants && (
                <Button variant="outline" size="sm" onClick={handleBackToProducts}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Products
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showVariants ? (
              // Products View
              <ScrollArea className="h-96">
                {topProducts && topProducts.length > 0 ? (
                  <div className="space-y-3">
                    {topProducts.map((product, index) => (
                      <div 
                        key={product._id} 
                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleProductClick(product)}
                      >
                        {console.log(product)}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.totalQuantity} units sold
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-bold">PKR {product.totalRevenue.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.orderCount} orders
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No product sales data available</p>
                    <p className="text-sm">Try adjusting your filters or check if you have any orders.</p>
                  </div>
                )}
              </ScrollArea>
            ) : (
              // Variants View
              <div className="space-y-4">
                {/* Product Summary */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Total: {selectedProduct.totalQuantity} units • PKR {selectedProduct.totalRevenue.toLocaleString()} revenue
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {selectedProduct.orderCount} orders
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Variants List */}
                <div>
                  <h4 className="font-medium mb-3">Variants Performance</h4>
                  {variantsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading variants...
                    </div>
                  ) : variantsError ? (
                    <div className="text-center py-8 text-destructive">
                      Error loading variants: {variantsError}
                    </div>
                  ) : (
                    <ScrollArea className="h-64">
                      {productVariants && productVariants.length > 0 ? (
                        <div className="space-y-3">
                          {productVariants.map((variant, index) => (
                            <div key={variant._id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                                  {index + 1}
                                </div>
                                <div>
                                    {console.log(variant)}
                                  <div className="font-medium">{variant.variantName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {variant.totalQuantity} units sold
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold">PKR {variant.totalRevenue.toLocaleString()}</div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    PKR {variant.avgPrice}/unit
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {((variant.totalRevenue / selectedProduct.totalRevenue) * 100).toFixed(1)}%
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No variant sales data available for {selectedProduct.name}</p>
                          <p className="text-sm">This product might not have sold any variants in the selected period.</p>
                        </div>
                      )}
                    </ScrollArea>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TopSellingProducts;