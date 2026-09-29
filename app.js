const STORAGE_KEY = "valentina-nails-appointments-v1";
const MAX_IMAGES_PER_APPOINTMENT = 5;
const MAX_IMAGE_BYTES = 360_000;
const MAX_STORAGE_CHARS = 3_500_000;

const elements = {
  todayLabel: document.querySelector("#today-label"),
  todayCount: document.querySelector("#today-count"),
  upcomingCount: document.querySelector("#upcoming-count"),
  totalCount: document.querySelector("#total-count"),
  resultCount: document.querySelector("#result-count"),
  list: document.querySelector("#appointment-list"),
  search: document.querySelector("#search-input"),
  filter: document.querySelector("#date-filter"),
  dialog: document.querySelector("#appointment-dialog"),
  form: document.querySelector("#appointment-form"),
  dialogTitle: document.querySelector("#dialog-title"),
  clientName: document.querySelector("#client-name"),
  service: document.querySelector("#service"),
  date: document.querySelector("#appointment-date"),
  time: document.querySelector("#appointment-time"),
  description: document.querySelector("#description"),
  imageInput: document.querySelector("#images"),
  imageCount: document.querySelector("#image-count"),
  imagePreviews: document.querySelector("#image-previews"),
  error: document.querySelector("#form-error"),
  save: document.querySelector("#save-appointment"),
  backup: document.querySelector("#export-backup"),
  toast: document.querySelector("#toast"),
};

let appointments = readAppointments();
let draftImages = [];
let editingId = null;
let toastTimer;

function readAppointments() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored.filter(isAppointment) : [];
  } catch {
    return [];
  }
}

function isAppointment(value) {
  return value && typeof value.id === "string"
    && typeof value.clientName === "string"
    && typeof value.service === "string"
    && /^\d{4}-\d{2}-\d{2}$/.test(value.date)
    && /^\d{2}:\d{2}$/.test(value.time)
    && Array.isArray(value.images);
}

function saveAppointments(nextAppointments) {
  const serialized = JSON.stringify(nextAppointments);
  if (serialized.length > MAX_STORAGE_CHARS) {
    throw new Error("El espacio de fotos para las citas está lleno. Quita alguna imagen para poder guardar.");
  }
  try {
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    throw new Error("El navegador no tiene espacio disponible. Descarga un respaldo y quita imágenes antiguas.");
  }
  appointments = nextAppointments;
  render();
}

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function appointmentDateTime(appointment) {
  return new Date(`${appointment.date}T${appointment.time}:00`);
}

function formatDate(dateString, options = { weekday: "long", day: "numeric", month: "long" }) {
  return new Intl.DateTimeFormat("es-CO", options).format(new Date(`${dateString}T12:00:00`));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function render() {
  const today = localDateString();
  const now = new Date();
  const upcoming = appointments.filter((item) => appointmentDateTime(item) >= now);
  const todayAppointments = appointments.filter((item) => item.date === today);
  elements.todayLabel.textContent = formatDate(today).toLocaleUpperCase("es-CO");
  elements.todayCount.textContent = todayAppointments.length;
  elements.upcomingCount.textContent = upcoming.length;
  elements.totalCount.textContent = appointments.length;
  elements.backup.disabled = appointments.length === 0;

  const query = elements.search.value.trim().toLocaleLowerCase("es-CO");
  const filter = elements.filter.value;
  const visible = appointments.filter((item) => {
    const isUpcoming = appointmentDateTime(item) >= now;
    const matchesFilter = filter === "all"
      || (filter === "today" && item.date === today)
      || (filter === "upcoming" && isUpcoming)
      || (filter === "past" && !isUpcoming);
    const matchesSearch = !query || `${item.clientName} ${item.service}`.toLocaleLowerCase("es-CO").includes(query);
    return matchesFilter && matchesSearch;
  }).sort((first, second) => appointmentDateTime(first) - appointmentDateTime(second));

  elements.resultCount.textContent = `${visible.length} ${visible.length === 1 ? "cita" : "citas"}`;
  if (visible.length === 0) {
    const isEmpty = appointments.length === 0;
    elements.list.innerHTML = `<div class="empty-state">
      <span class="empty-mark" aria-hidden="true">V</span>
      <h3>${isEmpty ? "Tu agenda empieza aquí" : "No hay citas para mostrar"}</h3>
      <p>${isEmpty ? "Agrega los detalles del próximo servicio y tendrás tus citas siempre a mano." : "Prueba otro filtro o cambia tu búsqueda."}</p>
      ${isEmpty ? '<button class="button button-primary" data-action="new" type="button"><span aria-hidden="true">+</span> Agendar primera cita</button>' : ""}
    </div>`;
    return;
  }

  const groups = new Map();
  visible.forEach((item) => {
    if (!groups.has(item.date)) groups.set(item.date, []);
    groups.get(item.date).push(item);
  });
  elements.list.innerHTML = [...groups.entries()].map(([date, items]) => `
    <section class="date-group" aria-label="Citas del ${escapeHtml(formatDate(date))}">
      <h3 class="date-heading">${escapeHtml(formatDate(date))}</h3>
      ${items.map(renderAppointment).join("")}
    </section>`).join("");
}

function renderAppointment(item) {
  const description = item.description ? `<p class="appointment-description">${escapeHtml(item.description)}</p>` : "";
  const photos = item.images.length ? `<span class="photo-count">${item.images.length} ${item.images.length === 1 ? "imagen" : "imágenes"}</span>` : "";
  return `<article class="appointment-row">
    <time class="appointment-time" datetime="${escapeHtml(item.date)}T${escapeHtml(item.time)}">${escapeHtml(item.time)}</time>
    <div class="appointment-main">
      <div class="appointment-client">${escapeHtml(item.clientName)}</div>
      <div class="appointment-service">${escapeHtml(item.service)}</div>
      ${description}
      ${photos ? `<div class="appointment-meta">${photos}</div>` : ""}
    </div>
    <div class="appointment-actions">
      <button class="text-button" type="button" data-action="edit" data-id="${escapeHtml(item.id)}">Editar</button>
      <button class="text-button danger" type="button" data-action="delete" data-id="${escapeHtml(item.id)}">Eliminar</button>
    </div>
  </article>`;
}

function notify(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("visible"), 3200);
}

function showDialog(appointment = null) {
  editingId = appointment?.id || null;
  draftImages = appointment ? [...appointment.images] : [];
  elements.form.reset();
  elements.dialogTitle.textContent = appointment ? "Editar cita" : "Nueva cita";
  elements.save.textContent = appointment ? "Guardar cambios" : "Guardar cita";
  elements.clientName.value = appointment?.clientName || "";
  elements.service.value = appointment?.service || "";
  elements.date.value = appointment?.date || localDateString();
  elements.time.value = appointment?.time || nextAvailableHour();
  elements.description.value = appointment?.description || "";
  elements.error.textContent = "";
  updatePreviews();
  elements.dialog.showModal();
  elements.clientName.focus();
}

function nextAvailableHour() {
  const date = new Date();
  date.setHours(date.getHours() + 1, 0, 0, 0);
  return `${String(date.getHours()).padStart(2, "0")}:00`;
}

function updatePreviews() {
  elements.imageCount.textContent = `${draftImages.length} de ${MAX_IMAGES_PER_APPOINTMENT} imágenes`;
  elements.imagePreviews.innerHTML = draftImages.map((source, index) => `
    <div class="image-preview">
      <img src="${source}" alt="Imagen de referencia ${index + 1}" />
      <button type="button" data-action="remove-image" data-index="${index}" aria-label="Quitar imagen ${index + 1}">×</button>
    </div>`).join("");
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo abrir una de las imágenes."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Una de las imágenes no se pudo procesar."));
      image.onload = () => {
        const scale = Math.min(1, 1400 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        let quality = 0.82;
        const encode = () => canvas.toBlob((blob) => {
          if (!blob) return reject(new Error("No se pudo optimizar una de las imágenes."));
          if (blob.size > MAX_IMAGE_BYTES && quality > 0.42) {
            quality -= 0.1;
            encode();
            return;
          }
          if (blob.size > MAX_IMAGE_BYTES) return reject(new Error("Una imagen sigue siendo muy pesada. Prueba con una imagen más pequeña."));
          const output = new FileReader();
          output.onerror = () => reject(new Error("No se pudo guardar una de las imágenes."));
          output.onload = () => resolve(output.result);
          output.readAsDataURL(blob);
        }, "image/jpeg", quality);
        encode();
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  elements.error.textContent = "";
  const clientName = elements.clientName.value.trim();
  const service = elements.service.value;
  const date = elements.date.value;
  const time = elements.time.value;
  const conflict = appointments.some((item) => item.id !== editingId && item.date === date && item.time === time);
  if (conflict) {
    elements.error.textContent = "Ya hay otra cita agendada a esa hora. Elige un horario diferente.";
    return;
  }

  const existing = appointments.find((item) => item.id === editingId);
  const appointment = {
    id: editingId || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`),
    clientName,
    service,
    date,
    time,
    description: elements.description.value.trim(),
    images: draftImages,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const nextAppointments = existing
    ? appointments.map((item) => item.id === editingId ? appointment : item)
    : [...appointments, appointment];

  try {
    saveAppointments(nextAppointments);
    elements.dialog.close();
    notify(existing ? "Cita actualizada." : "Cita agendada.");
  } catch (error) {
    elements.error.textContent = error.message;
  }
});

elements.imageInput.addEventListener("change", async () => {
  elements.error.textContent = "";
  const files = [...elements.imageInput.files];
  elements.imageInput.value = "";
  const slots = MAX_IMAGES_PER_APPOINTMENT - draftImages.length;
  if (files.length > slots) elements.error.textContent = `Puedes agregar hasta ${MAX_IMAGES_PER_APPOINTMENT} imágenes por cita.`;
  const accepted = files.slice(0, slots);
  elements.save.disabled = true;
  try {
    for (const file of accepted) {
      if (!file.type.startsWith("image/")) throw new Error("Selecciona únicamente archivos de imagen.");
      const image = await compressImage(file);
      const projected = appointments.reduce((total, item) => total + JSON.stringify(item).length, 0)
        + draftImages.reduce((total, item) => total + item.length, 0)
        + image.length;
      if (projected > MAX_STORAGE_CHARS) throw new Error("El espacio de fotos está lleno. Quita imágenes antiguas o descarga un respaldo.");
      draftImages.push(image);
    }
    updatePreviews();
  } catch (error) {
    elements.error.textContent = error.message;
  } finally {
    elements.save.disabled = false;
  }
});

document.querySelector("#new-appointment").addEventListener("click", () => showDialog());
document.querySelector("#close-dialog").addEventListener("click", () => elements.dialog.close());
document.querySelector("#cancel-dialog").addEventListener("click", () => elements.dialog.close());
elements.search.addEventListener("input", render);
elements.filter.addEventListener("change", render);

elements.list.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === "new") showDialog();
  if (action === "edit") {
    const appointment = appointments.find((item) => item.id === id);
    if (appointment) showDialog(appointment);
  }
  if (action === "delete") {
    const appointment = appointments.find((item) => item.id === id);
    if (!appointment || !window.confirm(`¿Eliminar la cita de ${appointment.clientName}? Esta acción no se puede deshacer.`)) return;
    try {
      saveAppointments(appointments.filter((item) => item.id !== id));
      notify("Cita eliminada.");
    } catch (error) {
      notify(error.message);
    }
  }
});

elements.imagePreviews.addEventListener("click", (event) => {
  const button = event.target.closest('button[data-action="remove-image"]');
  if (!button) return;
  draftImages.splice(Number(button.dataset.index), 1);
  updatePreviews();
});

elements.backup.addEventListener("click", () => {
  const backup = { app: "Valentina Nails", formatVersion: 1, exportedAt: new Date().toISOString(), appointments };
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `valentina-nails-respaldo-${localDateString()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  notify("Respaldo descargado.");
});

render();