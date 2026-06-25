-- ============================================================
-- MultiStore SaaS — Stock Migration
-- Run this in Supabase SQL Editor (Settings → SQL Editor)
-- Safe to run multiple times (uses IF NOT EXISTS)
-- Does NOT delete or modify existing data.
-- ============================================================

-- Add stock_enabled flag to stores (default false = stock disabled)
ALTER TABLE stores ADD COLUMN IF NOT EXISTS stock_enabled BOOLEAN NOT NULL DEFAULT false;

-- Add stock column to products (NULL = no stock tracking for this product)
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INT DEFAULT NULL
  CHECK (stock IS NULL OR stock >= 0);
