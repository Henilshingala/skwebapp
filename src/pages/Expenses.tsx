import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { supabase, Expense } from '../lib/supabase';
import { Plus, Trash2 } from 'lucide-react';

export function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    expense_type: '',
    description: '',
    amount: '',
    payment_mode: 'Cash',
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    if (data) setExpenses(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await supabase.from('expenses').insert({
      date: formData.date,
      expense_type: formData.expense_type,
      description: formData.description,
      amount: Number(formData.amount),
      payment_mode: formData.payment_mode,
    });

    setFormData({
      date: new Date().toISOString().split('T')[0],
      expense_type: '',
      description: '',
      amount: '',
      payment_mode: 'Cash',
    });
    setShowForm(false);
    loadExpenses();
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this expense?')) {
      await supabase.from('expenses').delete().eq('id', id);
      loadExpenses();
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Expenses</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Expense
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <h3 className="text-lg font-semibold mb-4">Record New Expense</h3>
          <form onSubmit={handleSubmit}>
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(value) => setFormData({ ...formData, date: value })}
              required
            />
            <Select
              label="Expense Type"
              value={formData.expense_type}
              onChange={(value) => setFormData({ ...formData, expense_type: value })}
              options={[
                { value: 'Rent', label: 'Rent' },
                { value: 'Electricity', label: 'Electricity' },
                { value: 'Transportation', label: 'Transportation' },
                { value: 'Packaging', label: 'Packaging' },
                { value: 'Marketing', label: 'Marketing' },
                { value: 'Salaries', label: 'Salaries' },
                { value: 'Other', label: 'Other' },
              ]}
              required
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Brief description of expense"
              required
            />
            <Input
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(value) => setFormData({ ...formData, amount: value })}
              required
              min="0"
              step="0.01"
            />
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
              <Button type="submit">Record Expense</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    date: new Date().toISOString().split('T')[0],
                    expense_type: '',
                    description: '',
                    amount: '',
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
        {expenses.map((expense) => (
          <Card key={expense.id}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{expense.expense_type}</h3>
                    <p className="text-sm text-gray-600">{expense.description}</p>
                  </div>
                  <span className="text-lg font-bold text-red-600">
                    ₹{Number(expense.amount).toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span>
                    <span className="text-gray-600">Date:</span>{' '}
                    {new Date(expense.date).toLocaleDateString()}
                  </span>
                  <span>
                    <span className="text-gray-600">Payment:</span> {expense.payment_mode}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(expense.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
        {expenses.length === 0 && (
          <Card>
            <p className="text-gray-500 text-center py-4">
              No expenses recorded yet. Add your first expense!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
