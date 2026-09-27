import { client } from './index.js';

export async function runMigrations() {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      contact_name TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      country TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'tenant_admin',
      country TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      refresh_token_hash TEXT NOT NULL,
      user_agent TEXT,
      ip_address TEXT,
      is_remember_me INTEGER NOT NULL DEFAULT 0,
      is_revoked INTEGER NOT NULL DEFAULT 0,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      is_used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tenant_settings (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
      base_currency TEXT NOT NULL DEFAULT 'USD',
      secondary_currency_code TEXT NOT NULL DEFAULT 'VES',
      secondary_currency_symbol TEXT NOT NULL DEFAULT 'Bs',
      exchange_rate TEXT NOT NULL DEFAULT '1.00000000',
      whatsapp_number TEXT,
      notification_email TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      logo_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS brand_categories (
      brand_id TEXT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (brand_id, category_id)
    );

    CREATE TABLE IF NOT EXISTS custom_attributes (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      sku TEXT,
      barcode TEXT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      short_description TEXT,
      brand_id TEXT REFERENCES brands(id) ON DELETE SET NULL,
      category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
      model_name TEXT,
      color TEXT,
      size TEXT,
      material TEXT,
      warranty_info TEXT,
      price_usd_1 TEXT NOT NULL,
      price_usd_2 TEXT,
      price_usd_3 TEXT,
      cost_usd TEXT,
      on_sale INTEGER DEFAULT 0,
      sale_price_usd TEXT,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      min_stock_alert INTEGER DEFAULT 5,
      allow_out_of_stock_purchase INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      featured_image TEXT,
      gallery_images TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_by TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      disabled_by TEXT,
      disabled_at TEXT
    );

    CREATE TABLE IF NOT EXISTS product_attribute_values (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      attribute_id TEXT NOT NULL REFERENCES custom_attributes(id) ON DELETE CASCADE,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      order_number TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_contact TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      country TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      total_usd TEXT NOT NULL,
      total_secondary TEXT NOT NULL,
      secondary_currency_code TEXT NOT NULL,
      exchange_rate_used TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      product_name TEXT NOT NULL,
      unit_price_usd TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal_usd TEXT NOT NULL
    );
  `);

  // Additive migrations: safe to run multiple times (column may already exist)
  const additiveMigrations = [
    `ALTER TABLE brands ADD COLUMN description TEXT`,
    `ALTER TABLE categories ADD COLUMN description TEXT`,
    // brand_categories is created via CREATE TABLE IF NOT EXISTS above — no ALTER needed
  ];

  for (const sql of additiveMigrations) {
    try {
      await client.execute(sql);
    } catch (err) {
      // SQLite throws if column already exists — safe to ignore
      if (!err.message?.includes('duplicate column name')) throw err;
    }
  }
}
