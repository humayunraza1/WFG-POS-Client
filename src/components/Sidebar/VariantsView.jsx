import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Plus } from 'lucide-react';

const VariantsView = ({ category, products, onAddToCart, onViewChange }) => {
  return (
    <Card className="h-[76dvh] flex flex-col overflow-auto">
      <CardHeader className="flex flex-col gap-2 flex-shrink-0 pb-4">
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
        </div>
        <CardTitle className="text-lg">{products.name}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-4 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex flex-wrap gap-3 pr-4">
            {products.variants?.map((product) => (
              <Card
                key={product.customId}
                className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden w-[140px] flex-shrink-0"
                onClick={() => onAddToCart(category, product)}
              >
                <div className="w-full h-20 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <CardContent className="p-2">
                  <h3 className="font-semibold text-xs leading-tight line-clamp-2 min-h-[28px]">
                    {product.name}
                  </h3>
                  <div className="mt-1.5 flex justify-between items-center">
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      PKR {product.price}
                    </Badge>
                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                      <Plus className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default VariantsView;