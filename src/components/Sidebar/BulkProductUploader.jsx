import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import useProducts from '@/hooks/useProducts';
import { toast } from 'sonner';
import SingleProductPopup from './SingleProductPopup';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBranches } from '@/features/branch/branchSlice';

const BulkProductUploader = ({ onBack }) => {
  const dispatch = useDispatch();
  const { categories, fetchCategories, bulkAddProducts,addCategory  } = useProducts();
  const { branches } = useSelector((state) => state.branch);
  const [newCategory, setNewCategory] = useState({
    name: '',
    imageUrl: '',
    assignedBranches: [],
    isPartnership: false,
    partnershipBusinessName: '',
    partnershipSharePercent: '',
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productsToAdd, setProductsToAdd] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
const [showDialog, setShowDialog] = useState(false);
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

  const handleAddProduct = (newProduct) => {
    setProductsToAdd(prev => [...prev, newProduct]);
    toast.success('Product added to batch');
  };

    const handleCreateCategory = async () => {
    try {
      const { name, imageUrl, assignedBranches, isPartnership, partnershipBusinessName, partnershipSharePercent } = newCategory;
      //console.log(newCategory)
      if (!name || !imageUrl) return toast.error('Both fields required');

      const normalizedSharePercent = Number(partnershipSharePercent || 0);
      if (isPartnership && (Number.isNaN(normalizedSharePercent) || normalizedSharePercent < 0 || normalizedSharePercent > 100)) {
        return toast.error('Partnership share percent must be between 0 and 100');
      }

      await addCategory({
        name,
        imageUrl,
        assignedBranches,
        isPartnership,
        partnershipBusinessName: isPartnership ? partnershipBusinessName.trim() : '',
        partnershipSharePercent: normalizedSharePercent,
      });
      await fetchCategories();
      setShowDialog(false);
      setNewCategory({ name: '', imageUrl: '', assignedBranches: [], isPartnership: false, partnershipBusinessName: '', partnershipSharePercent: '' });
      toast.success('Category added');
    } catch (err) {
      //console.log(err)
      toast.error('Error creating category');
    }
  };


  const handleSubmitAll = async () => {
    if (!selectedCategory || productsToAdd.length === 0) {
      return toast.error('Please select a category and add at least one product.');
    }

    try {
      const payload = productsToAdd.map(p => ({
        ...p,
        categoryId: selectedCategory
      }));
      await bulkAddProducts(payload);
      toast.success(`Successfully added ${productsToAdd.length} products.`);
      setProductsToAdd([]);
      onBack(); // go back to management
    } catch (error) {
      toast.error('Failed to add products in bulk.');
      console.error(error);
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
          <p className="text-xs text-muted-foreground">Use a partner share when these category items are sold.</p>
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
        <CardTitle>Bulk Add Products</CardTitle>
        <Button variant="ghost" onClick={onBack}>Back</Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Select Category</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
                    <div className="text-xs text-blue-600 hover:underline cursor-pointer mt-1" onClick={() => setShowDialog(true)}>
            + Add new category
          </div>
        </div>

        <Dialog open={showAddPopup} onOpenChange={setShowAddPopup}>
          <DialogTrigger asChild>
            <Button className="mt-2">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>

          <DialogContent>
            <SingleProductPopup
              onSubmit={(product) => {
                handleAddProduct(product);
                setShowAddPopup(false);
              }}
              onCancel={() => setShowAddPopup(false)}
            />
          </DialogContent>
        </Dialog>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-muted text-left">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Options</th>
                <th className="p-2">Image</th>
                <th className="p-2 text-center">Remove</th>
              </tr>
            </thead>
            <tbody>
              {productsToAdd.map((p, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.options.map(o => `${o.name} (${o.price})`).join(', ')}</td>
                  <td className="p-2 truncate max-w-[200px]">{p.imageUrl}</td>
                  <td className="p-2 text-center">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setProductsToAdd(productsToAdd.filter((_, index) => index !== i));
                    }}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button onClick={handleSubmitAll} disabled={productsToAdd.length === 0 || !selectedCategory}>
          Submit All ({productsToAdd.length})
        </Button>
      </CardContent>
    </>
  );
};

export default BulkProductUploader;
