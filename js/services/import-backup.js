const CSV_SEPARATOR = ";";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += character;
      }
      continue;
    }
    if (character === '"') quoted = true;
    else if (character === CSV_SEPARATOR) {
      row.push(cell);
      cell = "";
    } else if (character === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (character !== "\r") {
      cell += character;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function createId() {
  return globalThis.crypto?.randomUUID?.()
    || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function unquote(value) {
  const text = String(value ?? "");
  return /^'[=+\-@]/.test(text) ? text.slice(1) : text;
}

function normalizeImported(value) {
  if (!value || typeof value !== "object") return null;
  const date = unquote(value.date).trim();
  const time = unquote(value.time).trim();
  const clientName = unquote(value.clientName).trim();
  const service = unquote(value.service).trim();
  if (!DATE_PATTERN.test(date) || !TIME_PATTERN.test(time) || !clientName || !service) return null;

  const now = new Date().toISOString();
  return {
    id: typeof value.id === "string" && value.id ? value.id : createId(),
    clientName,
    service,
    date,
    time,
    description: unquote(value.description).trim(),
    images: Array.isArray(value.images) ? value.images.filter((source) => typeof source === "string") : [],
    completedAt: value.completedAt || null,
    createdAt: value.createdAt || now,
    updatedAt: value.updatedAt || now,
  };
}

function fromJson(text) {
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error("El archivo JSON no se pudo leer. Descárgalo de nuevo desde esta agenda.");
  }
  const list = Array.isArray(payload) ? payload : payload?.appointments;
  if (!Array.isArray(list)) throw new Error("El archivo no contiene el formato de respaldo de Valery Nails.");
  return list.map(normalizeImported).filter(Boolean);
}

function fromCsv(text) {
  const rows = parseCsvRows(text.replace(/^\uFEFF/, ""));
  if (rows.length < 2) throw new Error("El archivo CSV está vacío.");
  return rows.slice(1).map((row) => normalizeImported({
    clientName: row[2],
    service: row[3],
    date: row[0],
    time: row[1],
    description: row[4],
    completedAt: row[5] && row[5].toLowerCase().includes("completada") ? new Date().toISOString() : null,
  })).filter(Boolean);
}

export function readBackupFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo abrir el archivo seleccionado."));
    reader.onload = () => {
      const text = String(reader.result || "");
      try {
        const appointments = /\.json$/i.test(file.name) || text.trim().startsWith("{") || text.trim().startsWith("[")
          ? fromJson(text)
          : fromCsv(text);
        if (appointments.length === 0) throw new Error("El archivo no tiene citas que se puedan importar.");
        resolve(appointments);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsText(file);
  });
}
