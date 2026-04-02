import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { supabase, Purchase } from '../lib/supabase';
import { Plus, Trash2 } from 'lucide-react';

export function Purchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplier_name: '',
    item: '',
    quantity: '',
    rate: '',
  });

  useEffect(() => {
    loadPurchases();
  }, []);

  async function loadPurchases() {
    const { data } = await supabase
      .from('purchases')
      .select('*')
      .order('date', { ascending: false });
    if (data) setPurchases(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const total = Number(formData.quantity) * Number(formData.rate);

    await supabase.from('purchases').insert({
      date: formData.date,
      supplier_name: formData.supplier_name,
      item: formData.item,
      quantity: Number(formData.quantity),
      rate: Number(formData.rate),
      total,
    });

    setFormData({
      date: new Date().toISOString().split('T')[0],
      supplier_name: '',
      item: '',
      quantity: '',
      rate: '',
    });
    setShowForm(false);
    loadPurchases();
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this purchase?')) {
      await supabase.from('purchases').delete().eq('id', id);
      loadPurchases();
    }
  }

  const total = formData.quantity && formData.rate
    ? (Number(formData.quantity) * Number(formData.rate)).toFixed(2)
    : '0.00';

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Purchases</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Purchase
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <h3 className="text-lg font-semibold mb-4">Record New Purchase</h3>
          <form onSubmit={handleSubmit}>
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(value) => setFormData({ ...formData, date: value })}
              required
            />
            <Input
              label="Supplier Name"
              value={formData.supplier_name}
              onChange={(value) => setFormData({ ...formData, supplier_name: value })}
              required
            />
            <Input
              label="Item"
              value={formData.item}
              onChange={(value) => setFormData({ ...formData, item: value })}
              placeholder="Raw material name"
              required
            />
            <Input
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(value) => setFormData({ ...formData, quantity: value })}
              required
              min="0"
              step="0.01"
            />
            <Input
              label="Rate"
              type="number"
              value={formData.rate}
              onChange={(value) => setFormData({ ...formData, rate: value })}
              required
              min="0"
              step="0.01"
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total
              </label>
              <div className="px-3 py-2 bg-gray-100 rounded-lg font-semibold">
                ₹{total}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Record Purchase</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    date: new Date().toISOString().split('T')[0],
                    supplier_name: '',
                    item: '',
                    quantity: '',
                    rate: '',
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {purchases.map((purchase) => (
          <Card key={purchase.id}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{purchase.item}</h3>
                    <p className="text-sm text-gray-600">{purchase.supplier_name}</p>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    ₹{Number(purchase.total).toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span>
                    <span className="text-gray-600">Date:</span>{' '}
                    {new Date(purchase.date).toLocaleDateString()}
                  </span>
                  <span>
                    <span className="text-gray-600">Qty:</span> {purchase.quantity}
                  </span>
                  <span>
                    <span className="text-gray-600">Rate:</span> ₹{purchase.rate}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(purchase.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
        {purchases.length === 0 && (
          <Card>
            <p className="text-gray-500 text-center py-4">
              No purchases recorded yet. Add your first purchase!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
