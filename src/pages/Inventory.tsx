import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { supabase, Product, Inventory as InventoryType } from '../lib/supabase';
import { Plus, RefreshCw } from 'lucide-react';

export function Inventory() {
  const [inventory, setInventory] = useState<InventoryType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    opening_stock: '',
    produced: '',
  });

  useEffect(() => {
    loadInventory();
    loadProducts();
  }, []);

  async function loadInventory() {
    const { data } = await supabase
      .from('inventory')
      .select('*, products(name, unit)')
      .order('updated_at', { ascending: false });
    if (data) setInventory(data);
  }

  async function loadProducts() {
    const { data } = await supabase.from('products').select('*');
    if (data) setProducts(data);
  }

  async function calculateSold(productId: string) {
    const { data: sales } = await supabase
      .from('sales')
      .select('quantity')
      .eq('product_id', productId);

    return sales?.reduce((sum, sale) => sum + Number(sale.quantity), 0) || 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const sold = await calculateSold(formData.product_id);
    const currentStock =
      Number(formData.opening_stock) + Number(formData.produced) - sold;

    const { data: existing } = await supabase
      .from('inventory')
      .select('id')
      .eq('product_id', formData.product_id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('inventory')
        .update({
          opening_stock: Number(formData.opening_stock),
          produced: Number(formData.produced),
          current_stock: currentStock,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('inventory').insert({
        product_id: formData.product_id,
        opening_stock: Number(formData.opening_stock),
        produced: Number(formData.produced),
        current_stock: currentStock,
      });
    }

    setFormData({
      product_id: '',
      opening_stock: '',
      produced: '',
    });
    setShowForm(false);
    loadInventory();
  }

  async function refreshInventory() {
    for (const item of inventory) {
      const sold = await calculateSold(item.product_id);
      const currentStock = item.opening_stock + item.produced - sold;

      await supabase
        .from('inventory')
        .update({
          current_stock: currentStock,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id);
    }
    loadInventory();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Inventory</h2>
        <div className="flex gap-2">
          <Button onClick={refreshInventory} variant="secondary">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Stock
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-4">
          <h3 className="text-lg font-semibold mb-4">Update Inventory</h3>
          <form onSubmit={handleSubmit}>
            <Select
              label="Product"
              value={formData.product_id}
              onChange={(value) => setFormData({ ...formData, product_id: value })}
              options={products.map((p) => ({ value: p.id, label: p.name }))}
              required
            />
            <Input
              label="Opening Stock"
              type="number"
              value={formData.opening_stock}
              onChange={(value) => setFormData({ ...formData, opening_stock: value })}
              required
              min="0"
              step="0.01"
            />
            <Input
              label="Produced"
              type="number"
              value={formData.produced}
              onChange={(value) => setFormData({ ...formData, produced: value })}
              required
              min="0"
              step="0.01"
            />
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Current Stock will be calculated as: Opening Stock + Produced - Sold
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Update Inventory</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    product_id: '',
                    opening_stock: '',
                    produced: '',
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
        {inventory.map((item) => {
          const sold = item.opening_stock + item.produced - item.current_stock;
          const stockStatus =
            item.current_stock <= 0
              ? 'bg-red-100 text-red-800'
              : item.current_stock < 10
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800';

          return (
            <Card key={item.id}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">
                    {item.products?.name || 'Unknown Product'}
                  </h3>
                  <p className="text-sm text-gray-600">Unit: {item.products?.unit}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatus}`}>
                  {item.current_stock} in stock
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-600">Opening Stock</p>
                  <p className="font-semibold">{item.opening_stock}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-600">Produced</p>
                  <p className="font-semibold">{item.produced}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-600">Sold</p>
                  <p className="font-semibold">{sold.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-600">Current Stock</p>
                  <p className="font-semibold">{item.current_stock}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Last updated: {new Date(item.updated_at).toLocaleString()}
              </p>
            </Card>
          );
        })}
        {inventory.length === 0 && (
          <Card>
            <p className="text-gray-500 text-center py-4">
              No inventory records yet. Add your first stock entry!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
