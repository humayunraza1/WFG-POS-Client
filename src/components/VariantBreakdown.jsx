import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, TrendingUp } from 'lucide-react';
import axios from '@/api/axios';

const VariantBreakdown = ({ productId, productName, variants }) => {
  const [variantData, setVariantData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (productId && variants.length > 0) {
      fetchVariantBreakdown();
    }
  }, [productId, variants]);

  const fetchVariantBreakdown = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch sales data for each variant
      const variantPromises = variants.map(variant =>
        axios.get(`/orders/analytics/variant/${variant._id}`)
      );
      
      const responses = await Promise.all(variantPromises);
      
      const breakdownData = responses.map((response, index) => ({
        ...variants[index],
        ...response.data.stats
      }));

      // Sort by total revenue descending
      breakdownData.sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0));
      
      setVariantData(breakdownData);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Error fetching variant breakdown:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading variant breakdown...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-destructive">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  const totalRevenue = variantData.reduce((sum, variant) => sum + (variant.totalRevenue || 0), 0);
  const totalQuantity = variantData.reduce((sum, variant) => sum + (variant.totalQuantity || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Variant Breakdown - {productName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalRevenue > 0 ? (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">PKR {totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{totalQuantity}</div>
                <div className="text-sm text-muted-foreground">Total Units Sold</div>
              </div>
            </div>

            {/* Variant List */}
            <div className="space-y-3">
              {variantData.map((variant, index) => {
                const revenuePercent = totalRevenue > 0 ? (variant.totalRevenue / totalRevenue) * 100 : 0;
                const quantityPercent = totalQuantity > 0 ? (variant.totalQuantity / totalQuantity) * 100 : 0;
                
                return (
                  <div key={variant._id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{variant.name}</div>
                          <div className="text-sm text-muted-foreground">
                            PKR {variant.price?.toLocaleString()} per unit
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">PKR {(variant.totalRevenue || 0).toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {variant.totalQuantity || 0} units
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bars */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Revenue Share</span>
                        <span>{revenuePercent.toFixed(1)}%</span>
                      </div>
                      <Progress value={revenuePercent} className="h-2" />
                      
                      <div className="flex items-center justify-between text-sm">
                        <span>Quantity Share</span>
                        <span>{quantityPercent.toFixed(1)}%</span>
                      </div>
                      <Progress value={quantityPercent} className="h-2" />
                    </div>
                    
                    {/* Performance Indicators */}
                    <div className="flex gap-2">
                      {revenuePercent > 30 && (
                        <Badge variant="default" className="text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Top Performer
                        </Badge>
                      )}
                      {variant.totalQuantity > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      )}
                      {variant.totalQuantity === 0 && (
                        <Badge variant="outline" className="text-xs">
                          No Sales
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No sales data available for this product's variants</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VariantBreakdown;