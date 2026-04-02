import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Sales } from './pages/Sales';
import { Purchases } from './pages/Purchases';
import { Expenses } from './pages/Expenses';
import { Orders } from './pages/Orders';
import { Inventory } from './pages/Inventory';
import { Invoices } from './pages/Invoices';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  function renderPage() {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'sales':
        return <Sales />;
      case 'purchases':
        return <Purchases />;
      case 'expenses':
        return <Expenses />;
      case 'orders':
        return <Orders />;
      case 'inventory':
        return <Inventory />;
      case 'invoices':
        return <Invoices />;
      default:
        return <Dashboard />;
    }
  }

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;
