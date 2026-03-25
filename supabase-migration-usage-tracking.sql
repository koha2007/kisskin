-- Usage tracking table for subscription-based analysis limits
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  action text NOT NULL DEFAULT 'analysis',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Index for fast lookups by email + month
CREATE INDEX IF NOT EXISTS idx_usage_tracking_email_created
  ON usage_tracking (email, created_at DESC);

-- RLS: only service role can insert/read (API handles all access)
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- No public access — only service_role key can access
-- (No RLS policies needed; service_role bypasses RLS)
