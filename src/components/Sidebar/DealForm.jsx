import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useProducts from '@/hooks/useProducts';

const normalizeSelectionGroups = (selectionGroups = []) => {
  if (!Array.isArray(selectionGroups) || selectionGroups.length === 0) {
    return [{
      label: '',
      categoryId: '',
      required: true,
      minSelect: 1,
      maxSelect: 1,
      autoPriceDelta: 0,
      autoOverridePrice: '',
      items: [],
    }];
  }

  return selectionGroups.map((group) => ({
    label: group.label || '',
    categoryId: group.categoryId || '',
    required: group.required !== false,
    minSelect: group.minSelect ?? (group.required === false ? 0 : 1),
    maxSelect: group.maxSelect ?? 1,
    autoPriceDelta: Number(group.autoPriceDelta || 0),
    autoOverridePrice:
      group.autoOverridePrice === null || typeof group.autoOverridePrice === 'undefined'
        ? ''
        : Number(group.autoOverridePrice),
    items: (group.items || []).map((item) => ({
      productId: item.product?._id || item.product || '',
      optionId: item.optionId || '',
      priceDelta: Number(item.priceDelta || 0),
      overridePrice:
        item.overridePrice === null || typeof item.overridePrice === 'undefined'
          ? ''
          : Number(item.overridePrice),
    })),
  }));
};

const DealForm = ({ mode, deal = null, onBack, onSuccess }) => {
  const {
    categories,
    products,
    fetchCategories,
    fetchProducts,
    addDeal,
    updateDeal,
  } = useProducts();

  const [form, setForm] = useState({
    name: deal?.name || '',
    imageUrl: deal?.imageUrl || '',
    categoryId: deal?.category?._id || deal?.category || '',
    pricingMode: deal?.pricingMode || 'fixed',
    price: deal?.price ?? '',
    isActive: typeof deal?.isActive === 'boolean' ? deal.isActive : true,
  });

  const [selectionGroups, setSelectionGroups] = useState(normalizeSelectionGroups(deal?.selectionGroups));

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const optionsByProductId = useMemo(() => {
    const map = new Map();
    products.forEach((product) => {
      map.set(product._id, product.options || []);
    });
    return map;
  }, [products]);

  const updateSelectionGroup = (index, field, value) => {
    setSelectionGroups((prev) => {
      const copy = [...prev];
      const current = { ...copy[index] };

      if (field === 'required') {
        const checked = Boolean(value);
        current.required = checked;
        if (checked && Number(current.minSelect || 0) < 1) {
          current.minSelect = 1;
        }
      } else {
        current[field] = value;
      }

      copy[index] = current;
      return copy;
    });
  };

  const updateGroupItem = (groupIndex, itemIndex, field, value) => {
    setSelectionGroups((prev) => {
      const copy = [...prev];
      const group = { ...copy[groupIndex] };
      const items = [...(group.items || [])];
      const currentItem = { ...items[itemIndex] };

      if (field === 'productId') {
        currentItem.productId = value;
        currentItem.optionId = '';

        const selectedProduct = products.find((product) => product._id === value);
        if (selectedProduct?.category?._id && !group.categoryId) {
          group.categoryId = selectedProduct.category._id;
        }
      } else {
        currentItem[field] = value;
      }

      items[itemIndex] = currentItem;
      group.items = items;
      copy[groupIndex] = group;
      return copy;
    });
  };

  const addGroupItemRow = (groupIndex) => {
    setSelectionGroups((prev) => {
      const copy = [...prev];
      const group = { ...copy[groupIndex] };
      group.items = [
        ...(group.items || []),
        { productId: '', optionId: '', priceDelta: 0, overridePrice: '' },
      ];
      copy[groupIndex] = group;
      return copy;
    });
  };

  const removeGroupItemRow = (groupIndex, itemIndex) => {
    setSelectionGroups((prev) => {
      const copy = [...prev];
      const group = { ...copy[groupIndex] };
      group.items = (group.items || []).filter((_, i) => i !== itemIndex);
      copy[groupIndex] = group;
      return copy;
    });
  };

  const addSelectionGroupRow = () => {
    setSelectionGroups((prev) => [
      ...prev,
      {
        label: '',
        categoryId: '',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        autoPriceDelta: 0,
        autoOverridePrice: '',
        items: [],
      },
    ]);
  };

  const removeSelectionGroupRow = (index) => {
    setSelectionGroups((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.categoryId) {
      toast.error('Deal name and category are required.');
      return;
    }

    const normalizedSelectionGroups = selectionGroups
      .map((group) => {
        const required = group.required !== false;
        const minSelect = Number(group.minSelect);
        const maxSelect = Number(group.maxSelect);

        const normalizedMin = Number.isFinite(minSelect)
          ? (required ? Math.max(1, minSelect) : Math.max(0, minSelect))
          : (required ? 1 : 0);
        const normalizedMax = Number.isFinite(maxSelect) ? Math.max(1, maxSelect) : 1;

        const normalizedItems = (group.items || [])
          .filter((item) => item.productId && item.optionId)
          .map((item) => ({
            productId: item.productId,
            optionId: item.optionId,
            priceDelta:
              item.priceDelta === '' || item.priceDelta === null || typeof item.priceDelta === 'undefined'
                ? Number(group.autoPriceDelta || 0)
                : Number(item.priceDelta || 0),
            overridePrice:
              item.overridePrice === '' || item.overridePrice === null || typeof item.overridePrice === 'undefined'
                ? null
                : Number(item.overridePrice),
          }));

        return {
          label: (group.label || '').trim(),
          categoryId: group.categoryId,
          required,
          minSelect: normalizedMin,
          maxSelect: normalizedMax,
          autoPriceDelta: Number(group.autoPriceDelta || 0),
          autoOverridePrice:
            group.autoOverridePrice === '' || group.autoOverridePrice === null || typeof group.autoOverridePrice === 'undefined'
              ? null
              : Number(group.autoOverridePrice),
          items: normalizedItems,
        };
      })
      .filter((group) => Boolean(group.categoryId) || group.items.length > 0);

    if (normalizedSelectionGroups.length === 0) {
      toast.error('Please add at least one selection group with a category or specific options.');
      return;
    }

    const invalidGroup = normalizedSelectionGroups.find((group) => group.minSelect > group.maxSelect);
    if (invalidGroup) {
      toast.error('Every selection group must have min less than or equal to max.');
      return;
    }

    const parsedPrice = Number(form.price);
    if (form.pricingMode === 'fixed' && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
      toast.error('Deal price must be a valid number.');
      return;
    }

    const payload = {
      name: form.name,
      imageUrl: form.imageUrl,
      categoryId: form.categoryId,
      pricingMode: form.pricingMode,
      price: form.pricingMode === 'fixed' ? parsedPrice : 0,
      selectionGroups: normalizedSelectionGroups,
      isActive: form.isActive,
    };

    setLoading(true);
    try {
      if (mode === 'Add Deal') {
        await addDeal(payload);
        toast.success('Deal created successfully.');
      } else {
        await updateDeal(deal._id, payload);
        toast.success('Deal updated successfully.');
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save deal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
            <label className="text-sm font-medium">Deal Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Weekend Combo"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Image URL</label>
            <Input
              value={form.imageUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://example.com/deal-image.png"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Category</label>
            <Select
              value={form.categoryId}
              onValueChange={(value) => setForm((prev) => ({ ...prev, categoryId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Pricing Type</label>
            <Select
              value={form.pricingMode}
              onValueChange={(value) => setForm((prev) => ({ ...prev, pricingMode: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pricing type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed Meal Price</SelectItem>
                <SelectItem value="dynamic">Original + Delta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
              />
              Active deal
            </label>
          </div>
        </div>

        {form.pricingMode === 'fixed' && (
          <div>
            <label className="text-sm font-medium">Deal Price</label>
            <Input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              placeholder="0"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Selection Groups</label>
          {selectionGroups.map((group, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-3">
              <div className="grid grid-cols-12 gap-2 items-center">
                <Input
                  className="col-span-3"
                  value={group.label}
                  onChange={(e) => updateSelectionGroup(index, 'label', e.target.value)}
                  placeholder="Group label (e.g. Any Burger)"
                />

                <div className="col-span-3">
                  <Select
                    value={group.categoryId}
                    onValueChange={(value) => updateSelectionGroup(index, 'categoryId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Input
                  className="col-span-2"
                  type="number"
                  min={group.required ? 1 : 0}
                  value={group.minSelect}
                  onChange={(e) => updateSelectionGroup(index, 'minSelect', e.target.value)}
                  placeholder="Min"
                />

                <Input
                  className="col-span-2"
                  type="number"
                  min="1"
                  value={group.maxSelect}
                  onChange={(e) => updateSelectionGroup(index, 'maxSelect', e.target.value)}
                  placeholder="Max"
                />

                <label className="col-span-1 flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={group.required}
                    onChange={(e) => updateSelectionGroup(index, 'required', e.target.checked)}
                  />
                </label>

                <Button
                  className="col-span-1"
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSelectionGroupRow(index)}
                  disabled={selectionGroups.length === 1}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-6 text-xs text-muted-foreground">
                  Leave product options empty to auto-include every option from selected category.
                </div>
                <Input
                  className="col-span-3"
                  type="number"
                  value={group.autoPriceDelta}
                  onChange={(e) => updateSelectionGroup(index, 'autoPriceDelta', e.target.value)}
                  placeholder="Auto delta (e.g. -100)"
                />
                <Input
                  className="col-span-3"
                  type="number"
                  min="0"
                  value={group.autoOverridePrice}
                  onChange={(e) => updateSelectionGroup(index, 'autoOverridePrice', e.target.value)}
                  placeholder="Auto override (optional)"
                />
              </div>

              <div className="space-y-2">
                {(group.items || []).map((item, itemIndex) => {
                  const availableProducts = group.categoryId
                    ? products.filter((product) => product.category?._id === group.categoryId)
                    : products;
                  const options = optionsByProductId.get(item.productId) || [];

                  return (
                    <div key={`${index}-${itemIndex}`} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3">
                        <Select
                          value={item.productId}
                          onValueChange={(value) => updateGroupItem(index, itemIndex, 'productId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Product" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProducts.map((product) => (
                              <SelectItem key={product._id} value={product._id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-3">
                        <Select
                          value={item.optionId}
                          onValueChange={(value) => updateGroupItem(index, itemIndex, 'optionId', value)}
                          disabled={!item.productId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Option" />
                          </SelectTrigger>
                          <SelectContent>
                            {options.map((option) => (
                              <SelectItem key={option._id} value={option._id}>
                                {option.name} - Rs. {Number(option.price).toLocaleString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Input
                        className="col-span-2"
                        type="number"
                        value={item.priceDelta}
                        onChange={(e) => updateGroupItem(index, itemIndex, 'priceDelta', e.target.value)}
                        placeholder="Delta"
                      />

                      <Input
                        className="col-span-3"
                        type="number"
                        min="0"
                        value={item.overridePrice}
                        onChange={(e) => updateGroupItem(index, itemIndex, 'overridePrice', e.target.value)}
                        placeholder="Override price (optional)"
                      />

                      <Button
                        className="col-span-1"
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeGroupItemRow(index, itemIndex)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  );
                })}

                {(group.items || []).length === 0 && (
                  <div className="text-xs text-muted-foreground border rounded-md px-3 py-2">
                    No specific options selected. This group will use all options in the selected category.
                  </div>
                )}

                <Button variant="outline" size="sm" type="button" onClick={() => addGroupItemRow(index)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Product Option
                </Button>
              </div>
            </div>
          ))}

          <Button variant="outline" size="sm" type="button" onClick={addSelectionGroupRow}>
            <Plus className="w-4 h-4 mr-1" /> Add Selection Group
          </Button>
        </div>

        <Button disabled={loading} onClick={handleSubmit}>
          {loading ? (mode === 'Add Deal' ? 'Creating...' : 'Updating...') : mode}
        </Button>
      </CardContent>
    </>
  );
};

export default DealForm;
