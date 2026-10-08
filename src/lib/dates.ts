import type { DaySchedule, Slot } from "./types";

export const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
export const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
export const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const pad = (n: number) => String(n).padStart(2, "0");

export const toDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

export const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const minutesToTime = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

export const fmtTime12 = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const suf = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${pad(m)} ${suf}`;
};

export const fmtDateLong = (d: Date) => `${DAY_NAMES[d.getDay()]} ${d.getDate()} de ${MONTH_NAMES[d.getMonth()]}`;

export const fmtDateShort = (s: string) => {
  const d = new Date(s + "T00:00");
  return `${DAY_SHORT[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`.toLowerCase();
};

export const isPastDate = (s: string) => s < toDateStr(new Date());

export function buildSlots(schedule?: DaySchedule): Slot[] {
  if (!schedule || !schedule.works || !schedule.start || !schedule.end) return [];
  const slots: Slot[] = [];
  const start = timeToMinutes(schedule.start);
  const end = timeToMinutes(schedule.end);
  for (let m = start; m < end; m += 60) {
    const t = minutesToTime(m);
    const inBreak =
      !!schedule.breakStart &&
      !!schedule.breakEnd &&
      m >= timeToMinutes(schedule.breakStart) &&
      m < timeToMinutes(schedule.breakEnd);
    slots.push({ time: t, isBreak: inBreak });
  }
  return slots;
}