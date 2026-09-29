import { BRAND } from "../config.js";
import { localDateString } from "../utils/date.js";

const CSV_SEPARATOR = ";";
const CSV_HEADERS = [
  "Fecha",
  "Hora",
  "Clienta",
  "Servicio",
  "Descripción",
  "Estado",
  "Imágenes",
  "Registrada",
  "Actualizada",
];

function slug(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function triggerDownload(content, filename, mimeType) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvCell(value) {
  const text = String(value ?? "").replace(/\r?\n/g, " ");
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function toCsv(appointments) {
  const rows = appointments.map((item) => [
    item.date,
    item.time,
    item.clientName,
    item.service,
    item.description,
    item.completedAt ? "Completada" : "Pendiente",
    item.images.length,
    formatTimestamp(item.createdAt),
    formatTimestamp(item.updatedAt),
  ]);
  const body = [CSV_HEADERS, ...rows].map((row) => row.map(csvCell).join(CSV_SEPARATOR)).join("\r\n");
  return `\uFEFF${body}\r\n`;
}

export function downloadCsv(appointments) {
  if (appointments.length === 0) return false;
  const ordered = [...appointments].sort((first, second) => {
    const left = `${first.date}T${first.time}`;
    const right = `${second.date}T${second.time}`;
    return left < right ? -1 : left > right ? 1 : 0;
  });
  triggerDownload(
    toCsv(ordered),
    `${slug(BRAND.name)}-citas-${localDateString()}.csv`,
    "text/csv;charset=utf-8",
  );
  return true;
}

export function downloadJson(appointments) {
  const backup = {
    app: BRAND.name,
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    appointments,
  };
  triggerDownload(
    JSON.stringify(backup, null, 2),
    `${slug(BRAND.name)}-respaldo-${localDateString()}.json`,
    "application/json",
  );
  return true;
}

function formatTimestamp(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
}
