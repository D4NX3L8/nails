-- ============================================================
-- Datos de ejemplo (los mismos del voceto) — opcional, correr después de schema.sql
-- ============================================================

insert into services (name, price, duration_minutes, category) values
  ('Manicure semipermanente', 50000, 60, 'Semipermanente'),
  ('Uñas acrílicas esculpidas', 85000, 120, 'Acrílicas'),
  ('Diseño artístico a mano', 20000, 30, 'Diseños'),
  ('Manicure tradicional', 30000, 45, 'Tradicional'),
  ('Retiro + spa de manos', 25000, 40, 'Otros');

-- Nota: reemplaza estas URLs por fotos reales cuando las tengas.
-- Mientras tanto puedes usar imágenes placeholder o subirlas a Supabase Storage
-- (bucket "gallery") y pegar aquí la URL pública que te da Supabase.
insert into gallery_items (title, category, image_url, featured) values
  ('Almendra nude', 'Acrílicas', 'https://via.placeholder.com/400x400.png?text=Almendra+nude', true),
  ('Rosa clásico', 'Semipermanente', 'https://via.placeholder.com/400x400.png?text=Rosa+clasico', false),
  ('Línea dorada', 'Diseños', 'https://via.placeholder.com/400x400.png?text=Linea+dorada', false),
  ('French minimal', 'Tradicional', 'https://via.placeholder.com/400x400.png?text=French+minimal', false);
