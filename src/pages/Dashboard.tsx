import { useEffect, useState } from 'react';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/Card';
import { DollarSign, ShoppingCart, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  netProfit: number;
}

interface MonthlySales {
  month: string;
  amount: number;
}

interface TopProduct {
  name: string;
  quantity: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalPurchases: 0,
    totalExpenses: 0,
    netProfit: 0,
  });
  const [monthlySales, setMonthlySales] = useState<MonthlySales[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    const { data: sales } = await supabase
      .from('sales')
      .select('total, date, product_id, quantity');

    const { data: purchases } = await supabase
      .from('purchases')
      .select('total');

    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount');

    const { data: products } = await supabase
      .from('products')
      .select('id, name');

    const totalSales = sales?.reduce((sum, s) => sum + Number(s.total), 0) || 0;
    const totalPurchases = purchases?.reduce((sum, p) => sum + Number(p.total), 0) || 0;
    const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
    const netProfit = totalSales - totalPurchases - totalExpenses;

    setStats({
      totalSales,
      totalPurchases,
      totalExpenses,
      netProfit,
    });

    const salesByMonth: { [key: string]: number } = {};
    sales?.forEach((sale) => {
      const month = new Date(sale.date).toLocaleString('default', { month: 'short' });
      salesByMonth[month] = (salesByMonth[month] || 0) + Number(sale.total);
    });

    setMonthlySales(
      Object.entries(salesByMonth).map(([month, amount]) => ({
        month,
        amount,
      }))
    );

    const productSales: { [key: string]: { name: string; quantity: number } } = {};
    sales?.forEach((sale) => {
      const product = products?.find((p) => p.id === sale.product_id);
      if (product) {
        if (!productSales[product.id]) {
          productSales[product.id] = { name: product.name, quantity: 0 };
        }
        productSales[product.id].quantity += Number(sale.quantity);
      }
    });

    const sortedProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    setTopProducts(sortedProducts);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard
          title="Total Sales"
          value={`₹${stats.totalSales.toFixed(2)}`}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Total Purchases"
          value={`₹${stats.totalPurchases.toFixed(2)}`}
          icon={ShoppingCart}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Expenses"
          value={`₹${stats.totalExpenses.toFixed(2)}`}
          icon={TrendingDown}
          color="bg-red-500"
        />
        <StatCard
          title="Net Profit"
          value={`₹${stats.netProfit.toFixed(2)}`}
          icon={TrendingUp}
          color={stats.netProfit >= 0 ? 'bg-green-600' : 'bg-red-600'}
        />
      </div>

      <Card className="mb-4">
        <h3 className="text-lg font-semibold mb-3">Monthly Sales</h3>
        {monthlySales.length > 0 ? (
          <div className="space-y-2">
            {monthlySales.map((item) => (
              <div key={item.month} className="flex justify-between items-center">
                <span className="text-gray-600">{item.month}</span>
                <span className="font-semibold">₹{item.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No sales data available</p>
        )}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-3">Top Selling Products</h3>
        {topProducts.length > 0 ? (
          <div className="space-y-2">
            {topProducts.map((product, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600">{product.name}</span>
                <span className="font-semibold">{product.quantity} units</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No product data available</p>
        )}
      </Card>
    </div>
  );
}
