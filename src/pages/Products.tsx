import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { supabase, Product } from '../lib/supabase';
import { Plus, Trash2, CreditCard as Edit } from 'lucide-react';

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: 'kg',
    selling_price: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProducts(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingId) {
      await supabase
        .from('products')
        .update({
          name: formData.name,
          category: formData.category,
          unit: formData.unit,
          selling_price: Number(formData.selling_price),
        })
        .eq('id', editingId);
    } else {
      await supabase.from('products').insert({
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        selling_price: Number(formData.selling_price),
      });
    }

    setFormData({ name: '', category: '', unit: 'kg', selling_price: '' });
    setEditingId(null);
    setShowForm(false);
    loadProducts();
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      await supabase.from('products').delete().eq('id', id);
      loadProducts();
    }
  }

  function handleEdit(product: Product) {
    setFormData({
      name: product.name,
      category: product.category,
      unit: product.unit,
      selling_price: product.selling_price.toString(),
    });
    setEditingId(product.id);
    setShowForm(true);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Products</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Product
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Product' : 'Add New Product'}
          </h3>
          <form onSubmit={handleSubmit}>
            <Input
              label="Product Name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              required
            />
            <Input
              label="Category"
              value={formData.category}
              onChange={(value) => setFormData({ ...formData, category: value })}
              required
            />
            <Select
              label="Unit"
              value={formData.unit}
              onChange={(value) => setFormData({ ...formData, unit: value })}
              options={[
                { value: 'kg', label: 'Kilogram (kg)' },
                { value: 'piece', label: 'Piece' },
                { value: 'gram', label: 'Gram' },
                { value: 'packet', label: 'Packet' },
              ]}
              required
            />
            <Input
              label="Selling Price"
              type="number"
              value={formData.selling_price}
              onChange={(value) => setFormData({ ...formData, selling_price: value })}
              required
              min="0"
              step="0.01"
            />
            <div className="flex gap-2">
              <Button type="submit">
                {editingId ? 'Update' : 'Add'} Product
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ name: '', category: '', unit: 'kg', selling_price: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {products.map((product) => (
          <Card key={product.id}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.category}</p>
                <div className="flex gap-4 mt-2">
                  <span className="text-sm">
                    <span className="text-gray-600">Unit:</span> {product.unit}
                  </span>
                  <span className="text-sm">
                    <span className="text-gray-600">Price:</span> ₹{product.selling_price}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
        {products.length === 0 && (
          <Card>
            <p className="text-gray-500 text-center py-4">
              No products yet. Add your first product!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
