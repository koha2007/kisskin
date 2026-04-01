-- Allow authenticated users to read their own orders
-- Run this in Supabase SQL Editor

CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  USING (email = auth.jwt() ->> 'email');
