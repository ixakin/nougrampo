CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  image TEXT NOT NULL DEFAULT '',
  description_es TEXT NOT NULL,
  description_ca TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_de TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS brands_active_updated ON brands (active, updated_at);
