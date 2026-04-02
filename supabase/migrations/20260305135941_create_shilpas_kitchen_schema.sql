/*
  # Shilpa's Kitchen Business Management Schema

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, product name)
      - `category` (text, product category)
      - `unit` (text, kg or piece)
      - `selling_price` (numeric, price per unit)
      - `created_at` (timestamptz)
    
    - `sales`
      - `id` (uuid, primary key)
      - `date` (date, sale date)
      - `customer_name` (text)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (numeric)
      - `rate` (numeric, selling rate)
      - `total` (numeric, calculated)
      - `payment_mode` (text, Cash/UPI/Bank)
      - `created_at` (timestamptz)
    
    - `purchases`
      - `id` (uuid, primary key)
      - `date` (date, purchase date)
      - `supplier_name` (text)
      - `item` (text, raw material name)
      - `quantity` (numeric)
      - `rate` (numeric)
      - `total` (numeric)
      - `created_at` (timestamptz)
    
    - `expenses`
      - `id` (uuid, primary key)
      - `date` (date, expense date)
      - `expense_type` (text, category of expense)
      - `description` (text)
      - `amount` (numeric)
      - `payment_mode` (text, Cash/UPI/Bank)
      - `created_at` (timestamptz)
    
    - `orders`
      - `id` (uuid, primary key)
      - `date` (date, order date)
      - `customer_name` (text)
      - `phone_number` (text)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (numeric)
      - `delivery_address` (text)
      - `status` (text, Pending/Delivered)
      - `created_at` (timestamptz)
    
    - `inventory`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `opening_stock` (numeric)
      - `produced` (numeric)
      - `current_stock` (numeric, calculated)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (since this is a small business app without multi-user auth)
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  unit text NOT NULL DEFAULT 'kg',
  selling_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  customer_name text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity numeric NOT NULL DEFAULT 0,
  rate numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  payment_mode text NOT NULL DEFAULT 'Cash',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  supplier_name text NOT NULL,
  item text NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  rate numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  expense_type text NOT NULL,
  description text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  payment_mode text NOT NULL DEFAULT 'Cash',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  customer_name text NOT NULL,
  phone_number text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity numeric NOT NULL DEFAULT 0,
  delivery_address text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  opening_stock numeric NOT NULL DEFAULT 0,
  produced numeric NOT NULL DEFAULT 0,
  current_stock numeric NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to products"
  ON products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to products"
  ON products FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from products"
  ON products FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to sales"
  ON sales FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to sales"
  ON sales FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to sales"
  ON sales FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from sales"
  ON sales FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to purchases"
  ON purchases FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to purchases"
  ON purchases FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to purchases"
  ON purchases FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from purchases"
  ON purchases FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to expenses"
  ON expenses FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to expenses"
  ON expenses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to expenses"
  ON expenses FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from expenses"
  ON expenses FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to orders"
  ON orders FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from orders"
  ON orders FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to inventory"
  ON inventory FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to inventory"
  ON inventory FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to inventory"
  ON inventory FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from inventory"
  ON inventory FOR DELETE
  USING (true);