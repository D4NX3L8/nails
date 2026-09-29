import { CUSTOM_SERVICE, MAX_IMAGES_PER_APPOINTMENT, MAX_STORAGE_CHARS, SERVICES, STORAGE_KEY } from "../config.js";
import { elements } from "../dom.js";
import { compressImage } from "../services/image-processing.js";
import { localDateString, nextAvailableHour } from "../utils/date.js";
import { openLightbox } from "./lightbox.js";

function buildServiceOptions() {
  if (elements.service.options.length > 0) return;
  elements.service.innerHTML = [
    '<option value="">Selecciona un servicio</option>',
    ...SERVICES.map((service) => `<option value="${service}">${service}</option>`),
    `<option value="${CUSTOM_SERVICE}">Otro servicio…</option>`,
  ].join("");
}

export function createAppointmentForm({ onSubmit }) {
  let draftImages = [];
  let editingId = null;
  let originalCompletedAt = null;

  buildServiceOptions();

  function showError(message, field) {
    elements.error.textContent = message;
    if (field) {
      field.setAttribute("aria-invalid", "true");
      field.focus();
    }
  }

  function clearError() {
    elements.error.textContent = "";
    elements.clientName.removeAttribute("aria-invalid");
    elements.service.removeAttribute("aria-invalid");
    elements.date.removeAttribute("aria-invalid");
    elements.time.removeAttribute("aria-invalid");
    elements.customService.removeAttribute("aria-invalid");
  }

  function syncCustomService() {
    const isCustom = elements.service.value === CUSTOM_SERVICE;
    elements.customServiceField.hidden = !isCustom;
    elements.customService.required = isCustom;
  }

  function updatePreviews() {
    const total = draftImages.length;
    elements.imageCount.textContent = total === 0
      ? `Hasta ${MAX_IMAGES_PER_APPOINTMENT} imágenes`
      : `${total} de ${MAX_IMAGES_PER_APPOINTMENT} imágenes`;
    elements.imagePreviews.innerHTML = draftImages.map((source, index) => `
      <div class="image-preview">
        <button class="preview-open" type="button" data-action="preview-image" data-index="${index}" aria-label="Ver imagen ${index + 1} en grande">
          <img src="${source}" alt="Referencia ${index + 1}" />
        </button>
        <button type="button" data-action="remove-image" data-index="${index}" aria-label="Quitar imagen ${index + 1}">
          <svg class="icon" aria-hidden="true"><use href="#icon-close" /></svg>
        </button>
      </div>`).join("");
  }

  function open(appointment = null) {
    editingId = appointment?.id || null;
    originalCompletedAt = appointment?.completedAt || null;
    draftImages = appointment ? [...appointment.images] : [];
    clearError();
    elements.form.reset();
    elements.dialogTitle.textContent = appointment ? "Editar cita" : "Nueva cita";
    elements.save.textContent = appointment ? "Guardar cambios" : "Guardar cita";
    elements.clientName.value = appointment?.clientName || "";
    elements.completedToggle.checked = Boolean(originalCompletedAt);

    const known = SERVICES.includes(appointment?.service);
    if (appointment && !known) {
      elements.service.value = CUSTOM_SERVICE;
      elements.customService.value = appointment.service;
    } else {
      elements.service.value = appointment?.service || SERVICES[0];
      elements.customService.value = "";
    }
    syncCustomService();

    const today = localDateString();
    elements.date.min = editingId ? "" : today;
    elements.date.value = appointment?.date || today;
    elements.time.value = appointment?.time || nextAvailableHour();
    elements.description.value = appointment?.description || "";
    updatePreviews();

    elements.dialog.showModal();
    elements.clientName.focus();
  }

  function readData() {
    const service = elements.service.value === CUSTOM_SERVICE
      ? elements.customService.value.trim()
      : elements.service.value;

    if (!elements.clientName.value.trim()) throw { message: "Escribe el nombre de la clienta.", field: elements.clientName };
    if (!service) throw { message: "Elige o escribe el tipo de servicio.", field: elements.service.value === CUSTOM_SERVICE ? elements.customService : elements.service };
    if (!elements.date.value) throw { message: "Selecciona la fecha de la cita.", field: elements.date };
    if (!editingId && elements.date.value < localDateString()) throw { message: "Elige una fecha de hoy o posterior para agendar.", field: elements.date };
    if (!elements.time.value) throw { message: "Selecciona la hora de la cita.", field: elements.time };

    return {
      clientName: elements.clientName.value.trim(),
      service,
      date: elements.date.value,
      time: elements.time.value,
      description: elements.description.value.trim(),
      completedAt: elements.completedToggle.checked
        ? (originalCompletedAt || new Date().toISOString())
        : null,
      images: [...draftImages],
    };
  }

  elements.service.addEventListener("change", () => {
    syncCustomService();
    if (elements.service.value === CUSTOM_SERVICE) elements.customService.focus();
  });

  elements.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError();

    let data;
    try {
      data = readData();
    } catch (error) {
      showError(error.message, error.field);
      return;
    }

    elements.save.disabled = true;
    elements.save.textContent = "Guardando…";
    try {
      await onSubmit(data, editingId);
      elements.dialog.close();
    } catch (error) {
      showError(error.message);
    } finally {
      elements.save.disabled = false;
      elements.save.textContent = editingId ? "Guardar cambios" : "Guardar cita";
    }
  });

  elements.imageInput.addEventListener("change", async () => {
    clearError();
    const files = [...elements.imageInput.files];
    elements.imageInput.value = "";
    const slots = MAX_IMAGES_PER_APPOINTMENT - draftImages.length;
    if (slots <= 0) {
      showError(`Ya tienes ${MAX_IMAGES_PER_APPOINTMENT} imágenes en esta cita.`);
      return;
    }
    if (files.length > slots) {
      showError(`Puedes agregar hasta ${MAX_IMAGES_PER_APPOINTMENT} imágenes por cita.`);
    }

    elements.imageInput.disabled = true;
    try {
      for (const file of files.slice(0, slots)) {
        if (!file.type.startsWith("image/")) throw new Error("Selecciona únicamente archivos de imagen.");
        const image = await compressImage(file);
        const storedCharacters = (localStorage.getItem(STORAGE_KEY) || "").length;
        const draftCharacters = draftImages.reduce((total, source) => total + source.length, 0);
        if (storedCharacters + draftCharacters + image.length > MAX_STORAGE_CHARS) {
          throw new Error("El espacio de fotos está lleno. Quita imágenes antiguas o descarga un respaldo.");
        }
        draftImages.push(image);
      }
      updatePreviews();
    } catch (error) {
      showError(error.message);
    } finally {
      elements.imageInput.disabled = false;
    }
  });

  elements.imagePreviews.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const { action, index } = button.dataset;

    if (action === "preview-image") {
      openLightbox(draftImages, Number(index));
      return;
    }
    if (action === "remove-image") {
      draftImages.splice(Number(index), 1);
      updatePreviews();
    }
  });

  return { open };
}
