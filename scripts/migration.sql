-- ============================================================
-- MultiStore SaaS — Database Migration
-- Run this in Supabase SQL Editor (Settings → SQL Editor)
-- ============================================================

-- 0. Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TABLES
-- ============================================================

-- Drop existing tables if migrating from old schema
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS super_admin_log CASCADE;

-- 1a. Stores
CREATE TABLE stores (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$'),
  name        TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  description TEXT DEFAULT '',

  -- Branding
  logo_url    TEXT DEFAULT '',
  banner_url  TEXT DEFAULT '',
  banner_text TEXT DEFAULT '',
  banner_sub  TEXT DEFAULT '',

  -- Theme colors (hex format)
  primary_color   TEXT NOT NULL DEFAULT '#007bff' CHECK (primary_color ~ '^#[0-9a-fA-F]{6}$'),
  secondary_color TEXT NOT NULL DEFAULT '#0062cc' CHECK (secondary_color ~ '^#[0-9a-fA-F]{6}$'),
  accent_color    TEXT NOT NULL DEFAULT '#00c853' CHECK (accent_color ~ '^#[0-9a-fA-F]{6}$'),

  -- WhatsApp
  whatsapp_number  TEXT NOT NULL DEFAULT '' CHECK (char_length(whatsapp_number) <= 20),
  whatsapp_message TEXT NOT NULL DEFAULT 'Hola, quiero hacer un pedido',

  -- Access control
  admin_email TEXT NOT NULL CHECK (admin_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),

  -- State
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1b. Categories
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id   UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name       TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  slug       TEXT NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  sort_order INT NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (store_id, slug)
);

-- 1c. Products
CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id      UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  name          TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  description   TEXT DEFAULT '',
  price         NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  compare_price NUMERIC(12,2) DEFAULT NULL CHECK (compare_price IS NULL OR compare_price >= 0),
  image_url     TEXT DEFAULT '',
  is_available  BOOLEAN NOT NULL DEFAULT true,
  is_featured   BOOLEAN NOT NULL DEFAULT false,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1d. Super Admin Audit Log
CREATE TABLE super_admin_log (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action       TEXT NOT NULL,
  store_id     UUID REFERENCES stores(id) ON DELETE SET NULL,
  details      JSONB DEFAULT '{}',
  performed_by TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. INDEXES
-- ============================================================

CREATE INDEX idx_stores_slug          ON stores (slug);
CREATE INDEX idx_categories_store_id  ON categories (store_id);
CREATE INDEX idx_products_store_id    ON products (store_id);
CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_store_avail ON products (store_id, is_available);
CREATE INDEX idx_super_admin_log_time ON super_admin_log (created_at DESC);

-- ============================================================
-- 3. UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin_log ENABLE ROW LEVEL SECURITY;

-- ------- STORES -------

-- Public: anyone can read active stores
CREATE POLICY "stores_public_read" ON stores
  FOR SELECT USING (is_active = true);

-- Store admin: can read & update own store
CREATE POLICY "stores_admin_read" ON stores
  FOR SELECT TO authenticated
  USING (admin_email = (auth.jwt() ->> 'email'));

CREATE POLICY "stores_admin_update" ON stores
  FOR UPDATE TO authenticated
  USING (admin_email = (auth.jwt() ->> 'email'))
  WITH CHECK (admin_email = (auth.jwt() ->> 'email'));

-- ------- CATEGORIES -------

-- Public: read categories of active stores
CREATE POLICY "categories_public_read" ON categories
  FOR SELECT USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM stores WHERE stores.id = categories.store_id AND stores.is_active = true
    )
  );

-- Store admin: full CRUD on own store's categories
CREATE POLICY "categories_admin_all" ON categories
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = categories.store_id
        AND stores.admin_email = (auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = categories.store_id
        AND stores.admin_email = (auth.jwt() ->> 'email')
    )
  );

-- ------- PRODUCTS -------

-- Public: read available products of active stores
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (
    is_available = true
    AND EXISTS (
      SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.is_active = true
    )
  );

-- Store admin: full CRUD on own store's products
CREATE POLICY "products_admin_all" ON products
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
        AND stores.admin_email = (auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
        AND stores.admin_email = (auth.jwt() ->> 'email')
    )
  );

-- ------- SUPER ADMIN LOG -------

-- No public access. Only service_role can read/write.
-- (No policies = deny all for anon/authenticated; service_role bypasses RLS)

-- ============================================================
-- 5. STORAGE BUCKET (run separately or via dashboard)
-- ============================================================
-- Create bucket 'stores-assets' with public access for reads.
-- This is better done via Supabase Dashboard → Storage → New Bucket:
--   Name: stores-assets
--   Public: Yes
--
-- Then add these storage policies via Dashboard or SQL:
--
-- Policy: "Public read access"
--   Allowed operation: SELECT
--   Target: public
--   Policy: true
--
-- Policy: "Authenticated upload"
--   Allowed operation: INSERT
--   Target: authenticated
--   Policy: true
--
-- Policy: "Authenticated update"
--   Allowed operation: UPDATE
--   Target: authenticated
--   Policy: true
--
-- Policy: "Authenticated delete"
--   Allowed operation: DELETE
--   Target: authenticated
--   Policy: true
--
-- NOTE: Fine-grained per-store upload restrictions are enforced
-- at the API route level (server-side), not via storage policies,
-- because storage policies cannot easily reference the stores table.
-- The API routes validate store ownership before uploading.
