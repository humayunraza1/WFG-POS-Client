import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import useProducts from '@/hooks/useProducts';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const ProductForm = ({ mode, product = null, onBack, onSuccess }) => {
  const { addProduct, updateProduct, categories,fetchCategories, addCategory } = useProducts();

  const [showDialog, setShowDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', imageUrl: '' });
  const [form, setForm] = useState({
    name: product?.name || '',
    imageUrl: product?.imageUrl || '',
    categoryId: product?.category?._id || ''
  });

  const [options, setOptions] = useState(product?.options || [
    { name: '', price: '' }
  ]);

    useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    try {
      const { name, imageUrl } = newCategory;
      if (!name || !imageUrl) return toast.error('Both fields required');

      const res = await addCategory({ name, imageUrl });
      await fetchCategories();
      setForm(prev => ({ ...prev, categoryId: res._id }));
      setShowDialog(false);
      setNewCategory({ name: '', imageUrl: '' });
      toast.success('Category added');
    } catch (err) {
      //console.log(err)
      toast.error('Error creating category');
    }
  };

  const [loading, setLoading] = useState(false);

  const handleOptionChange = (index, field, value) => {
    const updated = [...options];
    updated[index][field] = value;
    setOptions(updated);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = {
        name: form.name,
        imageUrl: form.imageUrl,
        categoryId: form.categoryId,
        options: options.map(o => ({
          name: o.name,
          price: Number(o.price)
        }))
      };

      if (mode === 'Add Product') {
        try{
          await addProduct(payload);
          toast.success('Product added successfully')
        }catch(err){
          //console.log(err)
          toast.error(err)
        }
      } else if (mode === 'Edit Product') {
        try{
          await updateProduct(product._id, payload);
          toast.success('Product updated successfully')
        }catch(err){
          //console.log(err)
          toast.error(err)
        }
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add New Category</DialogTitle>
    </DialogHeader>
    <div className="space-y-2 mt-4">
      <div>
        <label className="text-sm font-medium">Name</label>
        <Input
          value={newCategory.name}
          onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
          placeholder="e.g. Appetizers"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Image URL</label>
        <Input
          value={newCategory.imageUrl}
          onChange={e => setNewCategory({ ...newCategory, imageUrl: e.target.value })}
          placeholder="https://example.com/image.png"
        />
      </div>
      <Button onClick={handleCreateCategory}>Create Category</Button>
    </div>
  </DialogContent>
</Dialog>

      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <CardTitle>{mode}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Product Name</label>
            <Input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Image URL</label>
            <Input
              value={form.imageUrl}
              onChange={e => setForm({ ...form, imageUrl: e.target.value })}
            />
          </div>
        </div>
                <div>
          <label className="text-sm font-medium">Category</label>
          <Select value={form.categoryId} onValueChange={val => setForm({ ...form, categoryId: val })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* ➕ Add new category link */}
          <div className="text-xs text-blue-600 hover:underline cursor-pointer mt-1" onClick={() => setShowDialog(true)}>
            + Add new category
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Options</label>
          {options.map((opt, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <Input
                className="col-span-5"
                value={opt.name}
                onChange={e => handleOptionChange(idx, 'name', e.target.value)}
                placeholder="Option name"
              />
              <Input
                className="col-span-5"
                type="number"
                value={opt.price}
                onChange={e => handleOptionChange(idx, 'price', e.target.value)}
                placeholder="Price"
              />
              <Button
                variant="ghost"
                size="icon"
                className="col-span-2"
                onClick={() => setOptions(options.filter((_, i) => i !== idx))}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setOptions([...options, { name: '', price: '' }])}>
            <Plus className="w-4 h-4 mr-1" /> Add Option
          </Button>
        </div>

        <Button disabled={loading} onClick={handleSubmit}>
          {loading ? (mode === 'Add Product' ? 'Adding...' : 'Updating...') : (mode === 'Add Product' ? 'Add Product' : 'Update Product')}
        </Button>
      </CardContent>
    </>
  );
};

export default ProductForm;
