import { supabase } from "./supabase";

// Mientras no exista login real, esto crea (o reutiliza) una sesión anónima
// de Supabase, y asegura que exista una fila en "profiles" para ese usuario.
// Cuando construyamos el login de verdad, esta función se reemplaza por el
// flujo real de auth.signInWithOtp / signInWithPassword, y el resto de las
// pantallas no cambia porque siguen leyendo supabase.auth.getUser().
export async function ensureSession(nombre: string = "Cliente de prueba") {
  const { data: sessionData } = await supabase.auth.getSession();

  let userId = sessionData.session?.user?.id;

  if (!userId) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.warn(
        "No se pudo iniciar sesión anónima. Revisa que 'Anonymous Sign-Ins' esté activado en Supabase > Authentication > Providers.",
        error.message
      );
      throw error;
    }
    userId = data.user?.id;
  }

  if (!userId) throw new Error("No se pudo obtener un usuario válido.");

  // Asegura que exista el perfil (idempotente gracias a upsert)
  await supabase.from("profiles").upsert(
    { id: userId, role: "cliente", full_name: nombre },
    { onConflict: "id" }
  );

  return userId;
}
