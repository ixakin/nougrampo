CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('griferias','sanitarios','aire-acondicionado','aerotermia','descalcificadores','termos','piscina','outlet')),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  image TEXT NOT NULL DEFAULT '',
  description_es TEXT NOT NULL,
  description_ca TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_de TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS products_active_type_updated ON products (active, type, updated_at);
