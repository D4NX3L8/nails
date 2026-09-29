import { elements } from "../dom.js";
import {
  appointmentDateTime,
  formatDate,
  formatDayLabel,
  formatToday,
  localDateString,
  meridiem,
} from "../utils/date.js";
import { escapeHtml } from "../utils/html.js";

const MAX_THUMBS = 4;

function isCompleted(appointment) {
  return Boolean(appointment.completedAt);
}

function matchesFilter(appointment, filter, today, now) {
  const isUpcoming = appointmentDateTime(appointment) >= now;
  if (filter === "today") return appointment.date === today;
  if (filter === "upcoming") return isUpcoming && !isCompleted(appointment);
  if (filter === "past") return !isUpcoming;
  if (filter === "done") return isCompleted(appointment);
  return true;
}

function visibleAppointments(appointments, { filter, query }) {
  const today = localDateString();
  const now = new Date();
  const search = query.trim().toLocaleLowerCase("es-CO");

  return appointments
    .filter((item) => matchesFilter(item, filter, today, now))
    .filter((item) => !search
      || `${item.clientName} ${item.service} ${item.description || ""}`
        .toLocaleLowerCase("es-CO")
        .includes(search))
    .sort((first, second) => appointmentDateTime(first) - appointmentDateTime(second));
}

function renderStats(appointments) {
  const today = localDateString();
  const now = new Date();
  const completed = appointments.filter(isCompleted);

  elements.todayLabel.textContent = formatToday();
  elements.todayCount.textContent = appointments.filter((item) => item.date === today).length;
  elements.upcomingCount.textContent = appointments.filter((item) => !isCompleted(item) && appointmentDateTime(item) >= now).length;
  elements.completedCount.textContent = completed.length;
  elements.totalCount.textContent = appointments.length;
}

export function renderAgenda(appointments) {
  renderStats(appointments);

  const filter = elements.filters.querySelector(".is-active")?.dataset.filter || "upcoming";
  const visible = visibleAppointments(appointments, { filter, query: elements.search.value });

  elements.resultCount.textContent = appointments.length === 0
    ? "Sin citas registradas"
    : `${visible.length} de ${appointments.length} ${appointments.length === 1 ? "cita" : "citas"}`;

  if (visible.length === 0) {
    elements.list.innerHTML = renderEmptyState(appointments.length === 0);
    return;
  }

  const groups = new Map();
  visible.forEach((item) => {
    if (!groups.has(item.date)) groups.set(item.date, []);
    groups.get(item.date).push(item);
  });

  elements.list.innerHTML = [...groups.entries()].map(([date, items], position) => `
    <section class="date-group" style="animation-delay:${Math.min(position, 6) * 40}ms">
      <h3 class="date-heading">
        <span class="date-when">${escapeHtml(formatDayLabel(date))}</span>
        <span class="date-full">${escapeHtml(formatDate(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" }))} · ${items.length} ${items.length === 1 ? "cita" : "citas"}</span>
      </h3>
      <div class="group-items">${items.map(renderAppointment).join("")}</div>
    </section>`).join("");
}

function renderEmptyState(isEmptyAgenda) {
  const filter = elements.filters.querySelector(".is-active")?.dataset.filter || "upcoming";
  const hasSearch = Boolean(elements.search.value.trim());

  if (hasSearch || !isEmptyAgenda) {
    return `<div class="empty-state">
      <span class="empty-mark" aria-hidden="true"><svg class="icon"><use href="#icon-search" /></svg></span>
      <h3>Sin resultados</h3>
      <p>No hay citas que coincidan con lo que buscas. Prueba con otro filtro o cambia la búsqueda.</p>
    </div>`;
  }

  const message = {
    upcoming: "Cuando agendes tu próxima cita aparecerá aquí, con todos los detalles del diseño.",
    today: "Hoy no tienes citas agendadas. Un buen momento para respirar o para captarte un trabajo nuevo.",
    past: "Todavía no hay citas pasadas en tu historial.",
    done: "Las citas que marques como completadas se archivarán aquí.",
    all: "Registra tu primera cita y organiza aquí todas tus clientas, servicios y referencias.",
  }[filter] || "Cuando agendes tu próxima cita aparecerá aquí, con todos los detalles del diseño.";

  return `<div class="empty-state">
    <span class="empty-mark" aria-hidden="true"><svg class="icon"><use href="#icon-sparkle" /></svg></span>
    <h3>Tu agenda empieza aquí</h3>
    <p>${message}</p>
    <button class="button button-primary" data-action="new" type="button">
      <svg class="icon" aria-hidden="true"><use href="#icon-plus" /></svg> Agendar primera cita
    </button>
  </div>`;
}

function renderStatusBadge(item) {
  if (isCompleted(item)) {
    return `<span class="badge badge-done"><svg class="icon" aria-hidden="true"><use href="#icon-check" /></svg> Completada</span>`;
  }
  const today = localDateString();
  if (item.date === today) return `<span class="badge badge-soon">Hoy</span>`;
  if (appointmentDateTime(item) < new Date()) return `<span class="badge badge-past">Sin completar</span>`;
  return "";
}

function renderThumbs(item) {
  if (item.images.length === 0) return "";
  const shown = item.images.slice(0, MAX_THUMBS);
  const extra = item.images.length - shown.length;

  const thumbs = shown.map((source, index) => `
    <button class="thumb" type="button" data-action="photo" data-id="${escapeHtml(item.id)}" data-index="${index}" aria-label="Ver imagen ${index + 1} de ${escapeHtml(item.clientName)}">
      <img src="${escapeHtml(source)}" alt="" loading="lazy" />
    </button>`).join("");

  const more = extra > 0
    ? `<span class="thumb thumb-more" aria-hidden="true">+${extra}</span>`
    : "";

  return `<div class="appointment-media">
    ${thumbs}${more}
    <span class="photo-note">${item.images.length} ${item.images.length === 1 ? "referencia" : "referencias"}</span>
  </div>`;
}

function renderAppointment(item, index) {
  const done = isCompleted(item);
  const today = localDateString();
  const isPast = !done && appointmentDateTime(item) < new Date();
  const classes = ["appointment-row"];
  if (done) classes.push("is-done");
  else if (item.date === today) classes.push("is-today");
  if (isPast) classes.push("is-past");

  const toggleLabel = done ? "Reabrir" : "Completar";
  const toggleIcon = done ? "icon-undo" : "icon-check";
  const toggleClass = done ? "action-button is-done" : "action-button";

  return `<article class="${classes.join(" ")}" style="animation-delay:${Math.min(index, 8) * 35}ms">
    <time class="appointment-time" datetime="${escapeHtml(item.date)}T${escapeHtml(item.time)}:00">
      <strong>${escapeHtml(item.time)}</strong>
      <span>${meridiem(item.time)}</span>
    </time>
    <div class="appointment-main">
      <div class="appointment-head">
        <span class="appointment-client">${escapeHtml(item.clientName)}</span>
        ${renderStatusBadge(item)}
      </div>
      <span class="appointment-service">${escapeHtml(item.service)}</span>
      ${item.description ? `<p class="appointment-description">${escapeHtml(item.description)}</p>` : ""}
      ${renderThumbs(item)}
    </div>
    <div class="appointment-actions">
      <button class="${toggleClass}" type="button" data-action="toggle" data-id="${escapeHtml(item.id)}">
        <svg class="icon" aria-hidden="true"><use href="#${toggleIcon}" /></svg> ${toggleLabel}
      </button>
      <button class="action-button" type="button" data-action="edit" data-id="${escapeHtml(item.id)}">
        <svg class="icon" aria-hidden="true"><use href="#icon-edit" /></svg> Editar
      </button>
      <button class="action-button is-danger" type="button" data-action="delete" data-id="${escapeHtml(item.id)}">
        <svg class="icon" aria-hidden="true"><use href="#icon-trash" /></svg>
        <span class="sr-only">Eliminar cita de ${escapeHtml(item.clientName)}</span>
      </button>
    </div>
  </article>`;
}
