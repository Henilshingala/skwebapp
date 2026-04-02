import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { supabase, Product, Sale } from '../lib/supabase';
import { Plus, Trash2 } from 'lucide-react';

export function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customer_name: '',
    product_id: '',
    quantity: '',
    rate: '',
    payment_mode: 'Cash',
  });

  useEffect(() => {
    loadSales();
    loadProducts();
  }, []);

  async function loadSales() {
    const { data } = await supabase
      .from('sales')
      .select('*, products(name)')
      .order('date', { ascending: false });
    if (data) setSales(data);
  }

  async function loadProducts() {
    const { data } = await supabase.from('products').select('*');
    if (data) setProducts(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const total = Number(formData.quantity) * Number(formData.rate);

    await supabase.from('sales').insert({
      date: formData.date,
      customer_name: formData.customer_name,
      product_id: formData.product_id,
      quantity: Number(formData.quantity),
      rate: Number(formData.rate),
      total,
      payment_mode: formData.payment_mode,
    });

    setFormData({
      date: new Date().toISOString().split('T')[0],
      customer_name: '',
      product_id: '',
      quantity: '',
      rate: '',
      payment_mode: 'Cash',
    });
    setShowForm(false);
    loadSales();
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this sale?')) {
      await supabase.from('sales').delete().eq('id', id);
      loadSales();
    }
  }

  function handleProductChange(productId: string) {
    const product = products.find((p) => p.id === productId);
    setFormData({
      ...formData,
      product_id: productId,
      rate: product ? product.selling_price.toString() : '',
    });
  }

  const total = formData.quantity && formData.rate
    ? (Number(formData.quantity) * Number(formData.rate)).toFixed(2)
    : '0.00';

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Sales</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Sale
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <h3 className="text-lg font-semibold mb-4">Record New Sale</h3>
          <form onSubmit={handleSubmit}>
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(value) => setFormData({ ...formData, date: value })}
              required
            />
            <Input
              label="Customer Name"
              value={formData.customer_name}
              onChange={(value) => setFormData({ ...formData, customer_name: value })}
              required
            />
            <Select
              label="Product"
              value={formData.product_id}
              onChange={handleProductChange}
              options={products.map((p) => ({ value: p.id, label: p.name }))}
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
            <Select
              label="Payment Mode"
              value={formData.payment_mode}
              onChange={(value) => setFormData({ ...formData, payment_mode: value })}
              options={[
                { value: 'Cash', label: 'Cash' },
                { value: 'UPI', label: 'UPI' },
                { value: 'Bank', label: 'Bank Transfer' },
              ]}
              required
            />
            <div className="flex gap-2">
              <Button type="submit">Record Sale</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    date: new Date().toISOString().split('T')[0],
                    customer_name: '',
                    product_id: '',
                    quantity: '',
                    rate: '',
                    payment_mode: 'Cash',
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
        {sales.map((sale) => (
          <Card key={sale.id}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{sale.customer_name}</h3>
                    <p className="text-sm text-gray-600">
                      {sale.products?.name || 'Unknown Product'}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    ₹{Number(sale.total).toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span>
                    <span className="text-gray-600">Date:</span>{' '}
                    {new Date(sale.date).toLocaleDateString()}
                  </span>
                  <span>
                    <span className="text-gray-600">Qty:</span> {sale.quantity}
                  </span>
                  <span>
                    <span className="text-gray-600">Rate:</span> ₹{sale.rate}
                  </span>
                  <span>
                    <span className="text-gray-600">Payment:</span> {sale.payment_mode}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(sale.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
        {sales.length === 0 && (
          <Card>
            <p className="text-gray-500 text-center py-4">
              No sales recorded yet. Add your first sale!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
