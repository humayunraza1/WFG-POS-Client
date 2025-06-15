import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';

const VariantsView = ({ category, products, onAddToCart, onViewChange }) => {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange('products')}
            className="gap-1 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="w-12" /> {/* Spacer for alignment */}
        </div>
          <CardTitle className="text-lg">{category.name}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-4">
          {products.variants?.map((product) => (
            <Card
              key={product.customId}
              className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden w-[180px]"
              onClick={() => onAddToCart(category, product)}
            >
              <div className="w-full h-32 overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              </div>
              <CardContent className="p-3">
                <h3 className="font-semibold text-sm leading-tight">{product.name}</h3>
                <div className="mt-2 flex justify-between items-center">
                  <Badge variant="outline" className="text-xs">
                    PKR {product.price}
                  </Badge>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VariantsView;
