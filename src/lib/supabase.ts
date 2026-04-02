import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  selling_price: number;
  created_at: string;
}

export interface Sale {
  id: string;
  date: string;
  customer_name: string;
  product_id: string;
  quantity: number;
  rate: number;
  total: number;
  payment_mode: string;
  created_at: string;
  products?: Product;
}

export interface Purchase {
  id: string;
  date: string;
  supplier_name: string;
  item: string;
  quantity: number;
  rate: number;
  total: number;
  created_at: string;
}

export interface Expense {
  id: string;
  date: string;
  expense_type: string;
  description: string;
  amount: number;
  payment_mode: string;
  created_at: string;
}

export interface Order {
  id: string;
  date: string;
  customer_name: string;
  phone_number: string;
  product_id: string;
  quantity: number;
  delivery_address: string;
  status: string;
  created_at: string;
  products?: Product;
}

export interface Inventory {
  id: string;
  product_id: string;
  opening_stock: number;
  produced: number;
  current_stock: number;
  updated_at: string;
  products?: Product;
}
