import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { supabase, Product } from '../lib/supabase';
import { Plus, Printer, Trash2 } from 'lucide-react';

interface InvoiceItem {
  product_id: string;
  product_name: string;
  quantity: number;
  rate: number;
  total: number;
}

interface Invoice {
  invoice_number: string;
  date: string;
  customer_name: string;
  items: InvoiceItem[];
  grand_total: number;
}

export function Invoices() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    invoice_number: `INV-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    customer_name: '',
  });
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    product_id: '',
    quantity: '',
    rate: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data } = await supabase.from('products').select('*');
    if (data) setProducts(data);
  }

  function handleAddItem() {
    if (!currentItem.product_id || !currentItem.quantity || !currentItem.rate) {
      alert('Please fill all item fields');
      return;
    }

    const product = products.find((p) => p.id === currentItem.product_id);
    if (!product) return;

    const total = Number(currentItem.quantity) * Number(currentItem.rate);

    setItems([
      ...items,
      {
        product_id: currentItem.product_id,
        product_name: product.name,
        quantity: Number(currentItem.quantity),
        rate: Number(currentItem.rate),
        total,
      },
    ]);

    setCurrentItem({
      product_id: '',
      quantity: '',
      rate: '',
    });
  }

  function handleRemoveItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function handleGenerateInvoice() {
    if (!formData.customer_name) {
      alert('Please enter customer name');
      return;
    }

    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    const grand_total = items.reduce((sum, item) => sum + item.total, 0);

    setCurrentInvoice({
      invoice_number: formData.invoice_number,
      date: formData.date,
      customer_name: formData.customer_name,
      items,
      grand_total,
    });

    setShowForm(false);
  }

  function handlePrint() {
    window.print();
  }

  function handleNewInvoice() {
    setCurrentInvoice(null);
    setFormData({
      invoice_number: `INV-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      customer_name: '',
    });
    setItems([]);
    setCurrentItem({
      product_id: '',
      quantity: '',
      rate: '',
    });
    setShowForm(true);
  }

  function handleProductChange(productId: string) {
    const product = products.find((p) => p.id === productId);
    setCurrentItem({
      ...currentItem,
      product_id: productId,
      rate: product ? product.selling_price.toString() : '',
    });
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h2 className="text-2xl font-bold">Invoices</h2>
        {!currentInvoice && (
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-1" />
            New Invoice
          </Button>
        )}
        {currentInvoice && (
          <div className="flex gap-2">
            <Button onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
            <Button onClick={handleNewInvoice} variant="secondary">
              New Invoice
            </Button>
          </div>
        )}
      </div>

      {showForm && !currentInvoice && (
        <Card className="mb-4">
          <h3 className="text-lg font-semibold mb-4">Create Invoice</h3>

          <Input
            label="Invoice Number"
            value={formData.invoice_number}
            onChange={(value) => setFormData({ ...formData, invoice_number: value })}
            required
          />
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

          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold mb-3">Add Items</h4>

            <Select
              label="Product"
              value={currentItem.product_id}
              onChange={handleProductChange}
              options={products.map((p) => ({ value: p.id, label: p.name }))}
            />
            <Input
              label="Quantity"
              type="number"
              value={currentItem.quantity}
              onChange={(value) => setCurrentItem({ ...currentItem, quantity: value })}
              min="0"
              step="0.01"
            />
            <Input
              label="Rate"
              type="number"
              value={currentItem.rate}
              onChange={(value) => setCurrentItem({ ...currentItem, rate: value })}
              min="0"
              step="0.01"
            />

            <Button type="button" onClick={handleAddItem} variant="secondary" className="mb-4">
              Add Item
            </Button>

            {items.length > 0 && (
              <div className="space-y-2 mb-4">
                <h5 className="font-medium">Items:</h5>
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-gray-50 p-2 rounded"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × ₹{item.rate} = ₹{item.total.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="text-right font-bold text-lg pt-2 border-t">
                  Grand Total: ₹{items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGenerateInvoice}>Generate Invoice</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowForm(false);
                setItems([]);
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {currentInvoice && (
        <div className="bg-white p-6 rounded-lg shadow print:shadow-none">
          <div className="text-center mb-6 border-b-2 border-orange-500 pb-4">
            <h1 className="text-3xl font-bold text-orange-600">Shilpa's Kitchen</h1>
            <p className="text-gray-600 mt-1">Homemade Snacks & Delicacies</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Invoice Number:</p>
              <p className="font-semibold">{currentInvoice.invoice_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date:</p>
              <p className="font-semibold">
                {new Date(currentInvoice.date).toLocaleDateString()}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Customer Name:</p>
              <p className="font-semibold">{currentInvoice.customer_name}</p>
            </div>
          </div>

          <table className="w-full mb-6">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2">Product</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-right py-2">Rate</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {currentInvoice.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2">{item.product_name}</td>
                  <td className="text-right py-2">{item.quantity}</td>
                  <td className="text-right py-2">₹{item.rate.toFixed(2)}</td>
                  <td className="text-right py-2">₹{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300">
                <td colSpan={3} className="text-right py-3 font-bold">
                  Grand Total:
                </td>
                <td className="text-right py-3 font-bold text-lg">
                  ₹{currentInvoice.grand_total.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="text-center text-sm text-gray-600 mt-8 pt-4 border-t">
            <p>Thank you for your business!</p>
          </div>
        </div>
      )}

      {!showForm && !currentInvoice && (
        <Card>
          <p className="text-gray-500 text-center py-8">
            Click "New Invoice" to create your first invoice
          </p>
        </Card>
      )}
    </div>
  );
}
