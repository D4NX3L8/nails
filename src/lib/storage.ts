import type { Appointment, ApptStatus, DaySchedule, Service } from "./types";

const KEYS = {
  services: "nails.services",
  appointments: "nails.appointments",
  schedule: "nails.schedule",
} as const;

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const DEFAULT_SERVICES: Service[] = [
  { id: "sv-1", name: "Manicure semipermanente", price: 50000, durationMinutes: 60, category: "Semipermanente", active: true },
  { id: "sv-2", name: "Uñas acrílicas esculpidas", price: 85000, durationMinutes: 120, category: "Acrílicas", active: true },
  { id: "sv-3", name: "Diseño artístico a mano", price: 20000, durationMinutes: 30, category: "Diseños", active: true },
  { id: "sv-4", name: "Manicure tradicional", price: 30000, durationMinutes: 45, category: "Tradicional", active: true },
  { id: "sv-5", name: "Retiro + spa de manos", price: 25000, durationMinutes: 40, category: "Otros", active: true },
];

export const DEFAULT_SCHEDULE: Record<number, DaySchedule> = {
  0: { works: false, start: "09:00", end: "18:00", breakStart: "12:00", breakEnd: "13:00" },
  1: { works: true, start: "09:00", end: "18:00", breakStart: "12:00", breakEnd: "13:00" },
  2: { works: true, start: "09:00", end: "18:00", breakStart: "12:00", breakEnd: "13:00" },
  3: { works: false, start: "10:00", end: "19:00", breakStart: "13:00", breakEnd: "14:00" },
  4: { works: true, start: "10:00", end: "19:00", breakStart: "13:00", breakEnd: "14:00" },
  5: { works: true, start: "09:00", end: "17:00", breakStart: "12:00", breakEnd: "13:00" },
  6: { works: true, start: "09:00", end: "14:00", breakStart: "", breakEnd: "" },
};

export function loadServices(): Service[] {
  return read<Service[]>(KEYS.services, DEFAULT_SERVICES);
}
export function saveServices(s: Service[]) {
  write(KEYS.services, s);
}

export function loadSchedule(): Record<number, DaySchedule> {
  const s = read<Record<number, DaySchedule>>(KEYS.schedule, DEFAULT_SCHEDULE);
  return { ...DEFAULT_SCHEDULE, ...s };
}
export function saveSchedule(s: Record<number, DaySchedule>) {
  write(KEYS.schedule, s);
}

export function loadAppointments(): Appointment[] {
  return read<Appointment[]>(KEYS.appointments, []);
}
export function saveAppointments(a: Appointment[]) {
  write(KEYS.appointments, a);
}

export function addAppointment(a: Appointment): Appointment[] {
  const all = loadAppointments();
  const next = [a, ...all];
  saveAppointments(next);
  return next;
}

export function updateAppointment(id: string, patch: Partial<Appointment>): Appointment[] {
  const all = loadAppointments();
  const next = all.map((a) => (a.id === id ? { ...a, ...patch } : a));
  saveAppointments(next);
  return next;
}

export function deleteAppointment(id: string): Appointment[] {
  const next = loadAppointments().filter((a) => a.id !== id);
  saveAppointments(next);
  return next;
}

export const STATUS_LABELS: Record<ApptStatus, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
};

export const money = (n: number) => "$" + n.toLocaleString("es-CO");