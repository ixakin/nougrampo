INSERT OR IGNORE INTO brands (id, name, active, image, description_es, description_ca, description_en, description_de, created_at, updated_at) VALUES
  ('grohe', 'GROHE', 1, 'assets/brands/grohe.svg', 'Diseño y tecnología para baños y cocinas.', 'Disseny i tecnologia per a banys i cuines.', 'Design and technology for bathrooms and kitchens.', 'Design und Technologie für Bad und Küche.', datetime('now'), datetime('now'));
UPDATE brands SET active = 1, image = 'assets/brands/grohe.svg' WHERE id = 'grohe';
