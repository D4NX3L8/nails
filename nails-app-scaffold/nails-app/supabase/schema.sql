-- ============================================================
-- NAILS — esquema inicial de base de datos (Supabase / Postgres)
-- Pega esto en Supabase > SQL Editor > Run
-- ============================================================

create extension if not exists "pgcrypto";

-- Perfiles: extiende auth.users con rol (cliente / manicurista)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('cliente', 'manicurista')) default 'cliente',
  full_name text,
  phone text,
  created_at timestamptz default now()
);

-- Servicios ofrecidos
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price integer not null,
  duration_minutes integer not null,
  category text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Galería de trabajos
create table if not exists gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text,
  category text,
  image_url text not null,
  featured boolean default false,
  created_at timestamptz default now()
);

-- Horario semanal de la manicurista (una fila por día, 0=Domingo .. 6=Sábado)
create table if not exists schedule (
  weekday int primary key check (weekday between 0 and 6),
  works boolean not null default false,
  start_time time,
  end_time time,
  break_start time,
  break_end time
);

-- Bloqueos puntuales de horario (vacaciones, imprevistos, etc.)
create table if not exists blocked_slots (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time time not null,
  unique (date, time)
);

-- Citas
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references profiles(id) on delete cascade,
  service_id uuid references services(id),
  date date not null,
  time time not null,
  status text not null check (status in ('pendiente', 'confirmada', 'cancelada', 'completada')) default 'pendiente',
  notes text,
  created_at timestamptz default now()
);

-- Notificaciones simples (además de push reales más adelante)
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  text text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Horario por defecto igual al del voceto (Lunes a Sábado, Miércoles y Domingo libres)
insert into schedule (weekday, works, start_time, end_time, break_start, break_end) values
  (0, false, null, null, null, null),
  (1, true, '09:00', '18:00', '12:00', '13:00'),
  (2, true, '09:00', '18:00', '12:00', '13:00'),
  (3, false, null, null, null, null),
  (4, true, '10:00', '19:00', '13:00', '14:00'),
  (5, true, '09:00', '17:00', '12:00', '13:00'),
  (6, true, '09:00', '14:00', null, null)
on conflict (weekday) do nothing;

-- ============================================================
-- Seguridad a nivel de fila (RLS) — punto de partida, ajustar luego
-- ============================================================
alter table profiles enable row level security;
alter table services enable row level security;
alter table gallery_items enable row level security;
alter table schedule enable row level security;
alter table blocked_slots enable row level security;
alter table appointments enable row level security;
alter table notifications enable row level security;

-- Servicios, galería y horario: lectura pública (cualquier cliente los ve sin login)
create policy "servicios visibles para todos" on services for select using (true);
create policy "galeria visible para todos" on gallery_items for select using (true);
create policy "horario visible para todos" on schedule for select using (true);
create policy "bloqueos visibles para todos" on blocked_slots for select using (true);

-- Perfiles: cada usuario ve y edita solo el suyo
create policy "ver mi perfil" on profiles for select using (auth.uid() = id);
create policy "editar mi perfil" on profiles for update using (auth.uid() = id);
create policy "crear mi perfil" on profiles for insert with check (auth.uid() = id);

-- Citas: la clienta ve/crea las suyas; la manicurista (marcada en profiles.role) ve todas
create policy "clienta ve sus citas" on appointments for select
  using (auth.uid() = client_id or exists (select 1 from profiles where id = auth.uid() and role = 'manicurista'));
create policy "clienta crea citas" on appointments for insert
  with check (auth.uid() = client_id);
create policy "actualizar citas" on appointments for update
  using (auth.uid() = client_id or exists (select 1 from profiles where id = auth.uid() and role = 'manicurista'));

-- Notificaciones: cada usuario ve solo las suyas
create policy "ver mis notificaciones" on notifications for select using (auth.uid() = user_id);
create policy "marcar mis notificaciones" on notifications for update using (auth.uid() = user_id);
