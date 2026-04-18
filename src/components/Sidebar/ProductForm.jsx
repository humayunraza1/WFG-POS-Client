import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import useProducts from '@/hooks/useProducts';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBranches } from '@/features/branch/branchSlice';

const ProductForm = ({ mode, product = null, onBack, onSuccess }) => {
  const dispatch = useDispatch();
  const { addProduct, updateProduct, categories,fetchCategories, addCategory } = useProducts();
  const { branches } = useSelector((state) => state.branch);

  const [showDialog, setShowDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    imageUrl: '',
    assignedBranches: [],
    isPartnership: false,
    partnershipBusinessName: '',
    partnershipSharePercent: '',
  });
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
    if (!branches.length) {
      dispatch(fetchBranches());
    }
  }, []);

  const toggleAssignedBranch = (branchCode, checked) => {
    setNewCategory((prev) => ({
      ...prev,
      assignedBranches: checked
        ? [...prev.assignedBranches, branchCode]
        : prev.assignedBranches.filter((code) => code !== branchCode),
    }));
  };

  const handleCreateCategory = async () => {
    try {
      const { name, imageUrl, assignedBranches, isPartnership, partnershipBusinessName, partnershipSharePercent } = newCategory;
      if (!name || !imageUrl) return toast.error('Both fields required');

      const normalizedSharePercent = Number(partnershipSharePercent || 0);
      if (isPartnership && (Number.isNaN(normalizedSharePercent) || normalizedSharePercent < 0 || normalizedSharePercent > 100)) {
        return toast.error('Partnership share percent must be between 0 and 100');
      }

      const res = await addCategory({
        name,
        imageUrl,
        assignedBranches,
        isPartnership,
        partnershipBusinessName: isPartnership ? partnershipBusinessName.trim() : '',
        partnershipSharePercent: normalizedSharePercent,
      });
      await fetchCategories();
      setForm(prev => ({ ...prev, categoryId: res._id }));
      setShowDialog(false);
      setNewCategory({ name: '', imageUrl: '', assignedBranches: [], isPartnership: false, partnershipBusinessName: '', partnershipSharePercent: '' });
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
      <div className="space-y-2 rounded-md border p-3">
        <div>
          <label className="text-sm font-medium">Branch Visibility</label>
          <p className="text-xs text-muted-foreground">Leave all unchecked to show this category in every branch.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {branches.map((branch) => (
            <label key={branch._id} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={newCategory.assignedBranches.includes(branch.branchCode)}
                onCheckedChange={(checked) => toggleAssignedBranch(branch.branchCode, checked === true)}
              />
              <span>{branch.name} ({branch.branchCode})</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between rounded-md border p-3">
        <div>
          <label className="text-sm font-medium">Partnership Category</label>
          <p className="text-xs text-muted-foreground">Enable this when sold line items should pay out a partner share.</p>
        </div>
        <Switch
          checked={newCategory.isPartnership}
          onCheckedChange={(checked) => setNewCategory((prev) => ({
            ...prev,
            isPartnership: checked,
            partnershipBusinessName: checked ? prev.partnershipBusinessName : '',
            partnershipSharePercent: checked ? prev.partnershipSharePercent : '',
          }))}
        />
      </div>
      {newCategory.isPartnership && (
        <>
          <div>
            <label className="text-sm font-medium">Partner Business Name</label>
            <Input
              value={newCategory.partnershipBusinessName}
              onChange={e => setNewCategory({ ...newCategory, partnershipBusinessName: e.target.value })}
              placeholder="e.g. Dough"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Our Share Percent</label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={newCategory.partnershipSharePercent}
              onChange={e => setNewCategory({ ...newCategory, partnershipSharePercent: e.target.value })}
              placeholder="e.g. 30 means we keep 30%"
            />
          </div>
        </>
      )}
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
