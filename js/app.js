import { STORAGE_KEY } from "./config.js";
import { elements } from "./dom.js";
import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  getSettings,
  getStorageUsage,
  replaceAppointments,
  restoreAppointment,
  saveProfile,
  saveSettings,
  setAppointmentCompleted,
  updateAppointment,
} from "./data/appointment-storage.js";
import { readBackupFile } from "./services/import-backup.js";
import { renderAgenda } from "./ui/appointment-list.js";
import { applyBrand } from "./ui/brand.js";
import { createAppointmentForm } from "./ui/appointment-form.js";
import { createProfileForm } from "./ui/profile-form.js";
import { downloadCsv, downloadJson } from "./ui/backup.js";
import { confirmAction, initConfirmDialog } from "./ui/confirm.js";
import { initLightbox, openLightbox } from "./ui/lightbox.js";
import { notify } from "./ui/toast.js";

let appointments = getAppointments();

const FILTERS = ["upcoming", "today", "all", "past", "done"];
const storedFilter = getSettings().view;
const filters = { view: FILTERS.includes(storedFilter) ? storedFilter : "upcoming" };

function refresh() {
  appointments = getAppointments();
  renderAgenda(appointments);
  renderStorageNote();
}

function renderStorageNote() {
  const { ratio } = getStorageUsage();
  const percent = ratio > 0 && ratio < 0.01 ? "<1" : Math.round(ratio * 100);
  elements.storageNote.innerHTML = `<span>Espacio usado: <strong>${percent}%</strong> del almacenamiento de citas.</span>
    <span class="meter" role="presentation"><span style="width:${Math.max(2, Math.round(ratio * 100))}%"></span></span>`;
}

const appointmentForm = createAppointmentForm({
  onSubmit(data, appointmentId) {
    const saved = appointmentId ? updateAppointment(appointmentId, data) : createAppointment(data);
    refresh();
    notify(appointmentId ? "Cita actualizada." : `Cita agendada para ${data.clientName}.`, { type: "success" });
    return saved;
  },
});

const profileForm = createProfileForm({
  onSubmit(profile) {
    saveProfile(profile);
    applyBrand(profile);
    notify(`Ahora tu agenda dice “${profile.businessName}”.`, { type: "success" });
  },
});

async function handleToggle(id) {
  const appointment = appointments.find((item) => item.id === id);
  if (!appointment) return;
  try {
    const completed = !appointment.completedAt;
    setAppointmentCompleted(id, completed);
    refresh();
    notify(completed
      ? `Cita de ${appointment.clientName} marcada como completada.`
      : `Cita de ${appointment.clientName} reabierta.`, { type: "success" });
  } catch (error) {
    notify(error.message, { type: "error" });
  }
}

async function handleDelete(id) {
  const appointment = appointments.find((item) => item.id === id);
  if (!appointment) return;

  const confirmed = await confirmAction({
    title: "¿Eliminar esta cita?",
    message: `Se va a eliminar la cita de ${appointment.clientName}${appointment.service ? ` (${appointment.service})` : ""}. Puedes deshacerlo desde el aviso que aparece abajo.`,
    acceptLabel: "Eliminar cita",
  });
  if (!confirmed) return;

  try {
    deleteAppointment(id);
    refresh();
    notify(`Cita de ${appointment.clientName} eliminada.`, {
      type: "info",
      action: {
        label: "Deshacer",
        onClick: () => {
          try {
            restoreAppointment(appointment);
            refresh();
            notify("Cita restaurada.", { type: "success" });
          } catch (error) {
            notify(error.message, { type: "error" });
          }
        },
      },
    });
  } catch (error) {
    notify(error.message, { type: "error" });
  }
}

function setFilter(filter) {
  filters.view = saveSettings({ view: filter }).view;
  elements.filters.querySelectorAll(".segment").forEach((button) => {
    const active = button.dataset.filter === filters.view;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  renderAgenda(appointments);
}

function toggleMenu(open) {
  elements.dataMenuPanel.hidden = !open;
  elements.dataMenuButton.setAttribute("aria-expanded", String(open));
}

async function handleImport(file) {
  const imported = await readBackupFile(file);
  const confirmed = await confirmAction({
    title: "Restaurar respaldo",
    message: `Se agregarán ${imported.length} ${imported.length === 1 ? "cita" : "citas"} a tu agenda. Las citas que ya tengas no se borran.`,
    acceptLabel: "Restaurar",
    danger: false,
  });
  if (!confirmed) return;

  try {
    replaceAppointments(imported);
    setFilter("all");
    refresh();
    notify(`${imported.length} ${imported.length === 1 ? "cita restaurada" : "citas restauradas"}.`, { type: "success" });
  } catch (error) {
    notify(error.message, { type: "error" });
  }
}

function initDataMenu() {
  elements.dataMenuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMenu(elements.dataMenuPanel.hidden);
  });

  document.addEventListener("click", (event) => {
    if (!elements.dataMenu.contains(event.target)) toggleMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.dataMenuPanel.hidden) toggleMenu(false);
  });

  elements.dataMenuPanel.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    toggleMenu(false);

    if (button.dataset.action === "profile") {
      profileForm.open();
      return;
    }

    if (button.dataset.action === "export-csv") {
      const done = downloadCsv(appointments);
      notify(done ? "Archivo CSV descargado. Ábrelo con Excel o Google Sheets." : "No hay citas para descargar.", { type: done ? "success" : "error" });
    }

    if (button.dataset.action === "export-json") {
      downloadJson(appointments);
      notify("Respaldo completo descargado, incluye las fotos.", { type: "success" });
    }

    if (button.dataset.action === "import") {
      elements.importInput.click();
    }
  });

  elements.importInput.addEventListener("change", async () => {
    const [file] = [...elements.importInput.files];
    elements.importInput.value = "";
    if (!file) return;
    try {
      await handleImport(file);
    } catch (error) {
      notify(error.message, { type: "error" });
    }
  });
}

elements.newAppointment.addEventListener("click", () => appointmentForm.open());
elements.closeDialog.addEventListener("click", () => elements.dialog.close());
elements.cancelDialog.addEventListener("click", () => elements.dialog.close());
elements.search.addEventListener("input", () => renderAgenda(appointments));
elements.filters.addEventListener("click", (event) => {
  const button = event.target.closest(".segment");
  if (button) setFilter(button.dataset.filter);
});

elements.list.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const { action, id, index } = button.dataset;

  if (action === "new") return appointmentForm.open();
  if (action === "edit") {
    const appointment = appointments.find((item) => item.id === id);
    if (appointment) appointmentForm.open(appointment);
    return;
  }
  if (action === "toggle") return handleToggle(id);
  if (action === "delete") return handleDelete(id);
  if (action === "photo") {
    const appointment = appointments.find((item) => item.id === id);
    if (appointment) openLightbox(appointment.images, Number(index));
  }
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const typing = target instanceof HTMLElement
    && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
  if (typing || event.metaKey || event.ctrlKey || event.altKey) return;
  if (elements.dialog.open || elements.profileDialog.open || elements.lightbox.open || elements.confirmDialog.open) return;
  if (event.key.toLowerCase() === "n") appointmentForm.open();
});

window.addEventListener("storage", (event) => {
  if (event.key === null || event.key === STORAGE_KEY) refresh();
});

initConfirmDialog();
initLightbox();
initDataMenu();
applyBrand();
setFilter(filters.view);
refresh();
