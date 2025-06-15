import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import useProducts from '../../hooks/useProducts';

const ProductManagement = ({ mode, product = null, onSuccess }) => {
  const { addProduct, updateProduct, products, fetchProducts } = useProducts();

  const [form, setForm] = useState({
    name: product?.name || '',
    imageUrl: product?.imageUrl || '',
  });

  const [variants, setVariants] = useState(
    product?.variants?.length > 0
      ? product.variants
      : [{ name: '', price: '', imageUrl: '' }]
  );

  const [selectedProductId, setSelectedProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const addVariantRow = () => {
    setVariants([...variants, { name: '', price: '', imageUrl: '' }]);
  };

  const removeVariantRow = (index) => {
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      imageUrl: form.imageUrl,
      variants: variants.map(v => ({
        name: v.name,
        price: Number(v.price),
        imageUrl: v.imageUrl,
      })),
    };

    try {
      setLoading(true);
      if (mode === 'add-product') {
        await addProduct(payload);
        toast.success('Product added successfully!');
        setForm({ name: '', imageUrl: '' });
        setVariants([{ name: '', price: '', imageUrl: '' }]);
      } else if (mode === 'edit-product' && selectedProductId) {
        await updateProduct(selectedProductId, payload);
        toast.success('Product updated successfully!');
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Submission error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load products only once when component mounts and mode is edit-product
  useEffect(() => {
    if (mode === 'edit-product' && !hasInitialized) {
      fetchProducts();
      setHasInitialized(true);
    }
  }, [mode, hasInitialized, fetchProducts]);

  // Load selected product data when selectedProductId changes
  useEffect(() => {
    if (mode === 'edit-product' && selectedProductId && products.length) {
      const found = products.find(p => p._id === selectedProductId);
      if (found) {
        setForm({ name: found.name, imageUrl: found.imageUrl });
        setVariants(found.variants || []);
      }
    }
  }, [selectedProductId, products, mode]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'add-product' ? 'Add New Product' : 'Edit Product'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">

          {mode === 'edit-product' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Product</label>
              <Select onValueChange={setSelectedProductId} value={selectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a product to edit" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(mode === 'add-product' || (mode === 'edit-product' && selectedProductId)) && (
            <>
              {/* Product Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Name</label>
                  <Input
                    value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Main Image URL</label>
                  <Input
                    value={form.imageUrl}
                    onChange={e => handleChange('imageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Variants */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Variants</label>
                <div className="border rounded-md overflow-hidden">
                  <div className="grid grid-cols-12 bg-muted p-2 text-sm font-medium">
                    <div className="col-span-4">Name</div>
                    <div className="col-span-3">Price</div>
                    <div className="col-span-4">Image URL</div>
                    <div className="col-span-1 text-center">Action</div>
                  </div>
                  {variants.map((variant, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 p-2 items-center">
                      <Input
                        className="col-span-4"
                        value={variant.name}
                        onChange={e => handleVariantChange(index, 'name', e.target.value)}
                        placeholder="Variant name"
                      />
                      <Input
                        className="col-span-3"
                        type="number"
                        min="0"
                        value={variant.price}
                        onChange={e => handleVariantChange(index, 'price', e.target.value)}
                        placeholder="Price"
                      />
                      <Input
                        className="col-span-4"
                        value={variant.imageUrl}
                        onChange={e => handleVariantChange(index, 'imageUrl', e.target.value)}
                        placeholder="Image URL"
                      />
                      <div className="col-span-1 flex justify-center">
                        {variants.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVariantRow(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={addVariantRow}>
                  <Plus className="w-4 h-4 mr-1" /> Add Variant
                </Button>
              </div>

              {/* Submit */}
              <Button
                className="w-full md:w-auto"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? mode === 'add-product'
                    ? 'Adding...'
                    : 'Updating...'
                  : mode === 'add-product'
                  ? 'Add Product'
                  : 'Update Product'}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductManagement;