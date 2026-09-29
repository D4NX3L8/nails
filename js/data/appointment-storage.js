import {
  DEFAULT_SETTINGS,
  LEGACY_STORAGE_KEYS,
  MAX_STORAGE_CHARS,
  SETTINGS_KEY,
  STORAGE_KEY,
} from "../config.js";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

function isAppointment(value) {
  return Boolean(value) && typeof value.id === "string"
    && typeof value.clientName === "string"
    && typeof value.service === "string"
    && DATE_PATTERN.test(value.date)
    && TIME_PATTERN.test(value.time)
    && Array.isArray(value.images);
}

function normalize(appointment) {
  return {
    ...appointment,
    description: typeof appointment.description === "string" ? appointment.description : "",
    completedAt: typeof appointment.completedAt === "string" ? appointment.completedAt : null,
    createdAt: appointment.createdAt || new Date().toISOString(),
    updatedAt: appointment.updatedAt || appointment.createdAt || new Date().toISOString(),
  };
}

function readKey(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed.filter(isAppointment).map(normalize) : [];
  } catch {
    return [];
  }
}

function migrateLegacyData() {
  try {
    if (localStorage.getItem(STORAGE_KEY) !== null) return;
    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      const legacy = readKey(legacyKey);
      if (legacy.length === 0) continue;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
      localStorage.removeItem(legacyKey);
      return;
    }
  } catch {
    /* si no se puede migrar se sigue trabajando con los datos actuales */
  }
}

migrateLegacyData();

export function getAppointments() {
  return readKey(STORAGE_KEY);
}

function persist(appointments) {
  const serialized = JSON.stringify(appointments);
  if (serialized.length > MAX_STORAGE_CHARS) {
    throw new Error("El espacio de fotos está lleno. Quita alguna imagen o descarga un respaldo.");
  }
  try {
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    throw new Error("El navegador no tiene espacio disponible. Descarga un respaldo y quita imágenes antiguas.");
  }
  return appointments;
}

function ensureAvailableTime(appointments, appointment) {
  const conflict = appointments.some((item) => item.id !== appointment.id
    && item.date === appointment.date && item.time === appointment.time);
  if (conflict) throw new Error("Ya hay otra cita agendada a esa hora. Elige un horario diferente.");
}

function createId() {
  return globalThis.crypto?.randomUUID?.()
    || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createAppointment(data) {
  const appointments = getAppointments();
  const now = new Date().toISOString();
  const appointment = { ...data, id: createId(), completedAt: data.completedAt || null, createdAt: now, updatedAt: now };
  ensureAvailableTime(appointments, appointment);
  persist([...appointments, appointment]);
  return appointment;
}

export function updateAppointment(id, data) {
  const appointments = getAppointments();
  const existing = appointments.find((item) => item.id === id);
  if (!existing) throw new Error("No se encontró la cita que quieres editar.");

  const appointment = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
  ensureAvailableTime(appointments, appointment);
  persist(appointments.map((item) => item.id === id ? appointment : item));
  return appointment;
}

export function setAppointmentCompleted(id, completed) {
  const appointments = getAppointments();
  const existing = appointments.find((item) => item.id === id);
  if (!existing) throw new Error("No se encontró la cita que quieres actualizar.");

  const appointment = {
    ...existing,
    completedAt: completed ? new Date().toISOString() : null,
    updatedAt: new Date().toISOString(),
  };
  persist(appointments.map((item) => item.id === id ? appointment : item));
  return appointment;
}

export function deleteAppointment(id) {
  const appointments = getAppointments();
  persist(appointments.filter((item) => item.id !== id));
}

export function restoreAppointment(appointment) {
  const appointments = getAppointments();
  if (appointments.some((item) => item.id === appointment.id)) return false;
  persist([...appointments, normalize(appointment)]);
  return true;
}

export function replaceAppointments(appointments) {
  const valid = appointments.filter(isAppointment).map(normalize);
  const known = new Set(valid.map((item) => item.id));
  const merged = [...getAppointments().filter((item) => !known.has(item.id)), ...valid];
  return persist(merged);
}

export function getSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    return { ...DEFAULT_SETTINGS, ...(stored && typeof stored === "object" ? stored : {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(patch) {
  const settings = { ...getSettings(), ...patch };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* los ajustes son opcionales: si falla, se usan los valores por defecto */
  }
  return settings;
}

export function saveProfile(patch) {
  const settings = { ...getSettings(), ...patch };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    throw new Error("El navegador no tiene espacio para guardar el logo. Prueba con una imagen más pequeña.");
  }
  return settings;
}

export function getStorageUsage() {
  try {
    const used = (localStorage.getItem(STORAGE_KEY) || "").length;
    return { used, ratio: Math.min(1, used / MAX_STORAGE_CHARS) };
  } catch {
    return { used: 0, ratio: 0 };
  }
}
