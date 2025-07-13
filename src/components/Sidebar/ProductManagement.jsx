import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Plus, Pencil, Upload } from 'lucide-react';
import useProducts from '@/hooks/useProducts';
import ProductForm from './ProductForm';
import BulkProductUploader from './BulkProductUploader';

const ProductManagement = () => {
  const { products, categories, fetchProducts, fetchCategories } = useProducts();
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit' | 'bulk'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.category._id === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <Card>
      {view === 'list' && (
        <>
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle>Product Management</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setView('bulk')}>
                <Upload className="w-4 h-4 mr-2" /> Bulk Add
              </Button>
              <Button onClick={() => setView('add')}>
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full md:w-1/3"
              />
              <Select onValueChange={value => setSelectedCategory(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-full md:w-1/4">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted text-left">
                  <tr>
                    <th className="p-2">Name</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Options</th>
                    <th className="p-2">Price Range</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => {
                    const prices = product.options.map(o => o.price);
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);
                    return (
                      <tr key={product._id} className="border-b">
                        <td className="p-2">{product.name}</td>
                        <td className="p-2">{product.category.name}</td>
                        <td className="p-2">{product.options.length}</td>
                        <td className="p-2">Rs. {min}{min !== max && ` - Rs. ${max}`}</td>
                        <td className="p-2 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedProduct(product);
                              setView('edit');
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </>
      )}

      {(view === 'add' || view === 'edit') && (
        <ProductForm
          mode={view === 'add' ? 'Add Product' : 'Edit Product'}
          product={view === 'edit' ? selectedProduct : null}
          onBack={() => {
            setView('list');
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            fetchProducts();
            setView('list');
            setSelectedProduct(null);
          }}
        />
      )}

      {view === 'bulk' && (
        <BulkProductUploader onBack={() => setView('list')} />
      )}
    </Card>
  );
};

export default ProductManagement;
