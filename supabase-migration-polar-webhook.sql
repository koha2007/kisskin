-- Polar webhook integration tables
-- Run this in Supabase SQL Editor

-- 1. Subscriptions table — synced from Polar via webhook
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  polar_subscription_id text UNIQUE NOT NULL,
  polar_customer_id text,
  email text NOT NULL,
  status text NOT NULL,  -- 'active', 'trialing', 'past_due', 'canceled', 'revoked'
  tier text NOT NULL DEFAULT 'pro',
  product_id text,
  product_name text,
  monthly_limit integer DEFAULT -1,
  trial_limit integer DEFAULT 5,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions (email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (email, status);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. Orders table — one-time purchase records
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  polar_order_id text UNIQUE NOT NULL,
  polar_checkout_id text,
  email text NOT NULL,
  product_id text,
  amount integer NOT NULL DEFAULT 0,
  currency text DEFAULT 'usd',
  status text NOT NULL DEFAULT 'succeeded',  -- 'succeeded', 'refunded'
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders (email);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 3. Webhook events table — idempotency
CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  processed_at timestamptz DEFAULT now() NOT NULL
);

-- Auto-cleanup: delete webhook events older than 7 days (optional, run as cron)
-- DELETE FROM webhook_events WHERE processed_at < now() - interval '7 days';
