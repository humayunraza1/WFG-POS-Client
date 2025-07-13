import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

const SingleProductPopup = ({ onSubmit, onCancel }) => {
  const [form, setForm] = useState({ name: '', imageUrl: '' });
  const [options, setOptions] = useState([{ name: '', price: '' }]);

  const handleOptionChange = (index, field, value) => {
    const updated = [...options];
    updated[index][field] = value;
    setOptions(updated);
  };

  const handleSubmit = () => {
    if (!form.name || !form.imageUrl || options.length === 0) return;
    onSubmit({ ...form, options });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Product Name</label>
        <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      </div>

      <div>
        <label className="text-sm font-medium">Image URL</label>
        <Input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
      </div>

      <div>
        <label className="text-sm font-medium">Options</label>
        {options.map((opt, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
            <Input
              className="col-span-6"
              value={opt.name}
              onChange={e => handleOptionChange(idx, 'name', e.target.value)}
              placeholder="Option name"
            />
            <Input
              className="col-span-4"
              type="number"
              value={opt.price}
              onChange={e => handleOptionChange(idx, 'price', e.target.value)}
              placeholder="Price"
            />
            <Button variant="ghost" size="icon" onClick={() => setOptions(options.filter((_, i) => i !== idx))}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => setOptions([...options, { name: '', price: '' }])}>
          <Plus className="w-4 h-4 mr-1" /> Add Option
        </Button>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit}>Add</Button>
      </div>
    </div>
  );
};

export default SingleProductPopup;
