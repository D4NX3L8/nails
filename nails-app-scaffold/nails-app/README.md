# Nails — proyecto base (Expo + Supabase)

Este es el punto de partida real de la app, construido a partir del voceto interactivo.
Ya están conectadas de verdad a Supabase: **Inicio**, **Agendar cita** (flujo completo de
4 pasos) y **Mis citas**. **Servicios** y **Galería** siguen de "placeholder".
El panel de la manicurista todavía no está — se agrega después de tener el login real.

> **Importante:** en Supabase, ve a Authentication → Providers y activa
> "Anonymous Sign-Ins". Mientras no exista login real, la app crea una sesión anónima
> automáticamente para poder guardar las citas (ver `lib/auth.ts`).

## 1. Instalar dependencias

```bash
npm install
```

## 2. Conectar tu proyecto de Supabase

1. Copia `.env.example` a `.env`.
2. Ve a tu proyecto en supabase.com → Settings → API y copia la **Project URL** y la
   **anon public key** dentro del `.env`.
3. En Supabase → SQL Editor, corre en orden:
   - `supabase/schema.sql` (crea las tablas)
   - `supabase/seed.sql` (opcional, agrega los mismos servicios de ejemplo del voceto)

## 3. Correr la app

```bash
npx expo start
```

Escanea el código QR con la app **Expo Go** desde tu celular (iOS o Android). Los
cambios que hagas en el código se reflejan al instante en el teléfono (hot reload).

## Estructura

```
App.tsx                  → navegación (barra inferior de la cliente)
lib/supabase.ts          → cliente de Supabase
screens/cliente/*        → pantallas de la cliente (Inicio ya conectada)
supabase/schema.sql       → tablas + seguridad (RLS)
supabase/seed.sql         → datos de ejemplo iguales al voceto
tailwind.config.js        → mismos colores y tipografías del voceto
```

## Próximos pasos sugeridos (en orden)

1. ~~Portar el flujo de Agendar completo~~ ✅ hecho — `screens/cliente/AgendarScreen.tsx`
   ya lee `schedule`, `appointments` y `blocked_slots` reales de Supabase.
2. Portar **Servicios** y **Galería** (hoy son placeholders) siguiendo el mismo patrón
   que `InicioScreen.tsx` (una consulta `supabase.from(...).select(...)` en un `useEffect`).
3. Agregar autenticación real (`supabase.auth.signInWithOtp` o email+contraseña) y
   usar `profiles.role` para decidir si se muestra la vista de cliente o de manicurista.
   Esto reemplaza la sesión anónima de `lib/auth.ts`.
4. Construir el panel de la manicurista (Dashboard, Calendario, Solicitudes, Horarios)
   como un segundo stack de navegación, visible solo si `role === 'manicurista'`.
5. Conectar notificaciones push (Expo Notifications + Supabase Realtime, o Firebase
   Cloud Messaging) para reemplazar las notificaciones simuladas del voceto.
6. Cuando esté lista para probar con la clienta: `eas build --profile preview` genera
   un instalable interno para iOS y Android sin necesidad de pasar por las tiendas todavía.
