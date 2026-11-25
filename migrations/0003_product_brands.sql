ALTER TABLE products ADD COLUMN brand_id TEXT REFERENCES brands(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS products_brand_id ON products (brand_id);
