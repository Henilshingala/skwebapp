import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { supabase, Product, Order } from '../lib/supabase';
import { Plus, Trash2, CheckCircle } from 'lucide-react';

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customer_name: '',
    phone_number: '',
    product_id: '',
    quantity: '',
    delivery_address: '',
  });

  useEffect(() => {
    loadOrders();
    loadProducts();
  }, []);

  async function loadOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, products(name)')
      .order('date', { ascending: false });
    if (data) setOrders(data);
  }

  async function loadProducts() {
    const { data } = await supabase.from('products').select('*');
    if (data) setProducts(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await supabase.from('orders').insert({
      date: formData.date,
      customer_name: formData.customer_name,
      phone_number: formData.phone_number,
      product_id: formData.product_id,
      quantity: Number(formData.quantity),
      delivery_address: formData.delivery_address,
      status: 'Pending',
    });

    setFormData({
      date: new Date().toISOString().split('T')[0],
      customer_name: '',
      phone_number: '',
      product_id: '',
      quantity: '',
      delivery_address: '',
    });
    setShowForm(false);
    loadOrders();
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this order?')) {
      await supabase.from('orders').delete().eq('id', id);
      loadOrders();
    }
  }

  async function toggleStatus(order: Order) {
    const newStatus = order.status === 'Pending' ? 'Delivered' : 'Pending';
    await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', order.id);
    loadOrders();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Orders</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Order
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <h3 className="text-lg font-semibold mb-4">Add New Order</h3>
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
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone_number}
              onChange={(value) => setFormData({ ...formData, phone_number: value })}
              placeholder="10-digit mobile number"
              required
            />
            <Select
              label="Product"
              value={formData.product_id}
              onChange={(value) => setFormData({ ...formData, product_id: value })}
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
              label="Delivery Address"
              value={formData.delivery_address}
              onChange={(value) => setFormData({ ...formData, delivery_address: value })}
              placeholder="Full delivery address"
              required
            />
            <div className="flex gap-2">
              <Button type="submit">Add Order</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    date: new Date().toISOString().split('T')[0],
                    customer_name: '',
                    phone_number: '',
                    product_id: '',
                    quantity: '',
                    delivery_address: '',
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
        {orders.map((order) => (
          <Card key={order.id}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{order.customer_name}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Delivered'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {order.products?.name || 'Unknown Product'} - {order.quantity} units
                </p>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-gray-600">Phone:</span> {order.phone_number}
                  </p>
                  <p>
                    <span className="text-gray-600">Address:</span> {order.delivery_address}
                  </p>
                  <p>
                    <span className="text-gray-600">Date:</span>{' '}
                    {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 ml-2">
                <button
                  onClick={() => toggleStatus(order)}
                  className={`p-2 rounded ${
                    order.status === 'Pending'
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-yellow-600 hover:bg-yellow-50'
                  }`}
                  title={order.status === 'Pending' ? 'Mark as Delivered' : 'Mark as Pending'}
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(order.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
        {orders.length === 0 && (
          <Card>
            <p className="text-gray-500 text-center py-4">
              No orders yet. Add your first order!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
