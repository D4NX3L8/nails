const DAY_MS = 86_400_000;

export function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function appointmentDateTime(appointment) {
  return new Date(`${appointment.date}T${appointment.time}:00`);
}

export function formatDate(dateString, options = { weekday: "long", day: "numeric", month: "long" }) {
  return new Intl.DateTimeFormat("es-CO", options).format(new Date(`${dateString}T12:00:00`));
}

export function formatDayLabel(dateString) {
  const target = new Date(`${dateString}T12:00:00`);
  const today = new Date(`${localDateString()}T12:00:00`);
  const days = Math.round((target - today) / DAY_MS);

  if (days === 0) return "Hoy";
  if (days === 1) return "Mañana";
  if (days === -1) return "Ayer";
  return capitalize(formatDate(dateString, { day: "numeric", month: "short" }));
}

export function meridiem(time) {
  return Number(time.slice(0, 2)) < 12 ? "a. m." : "p. m.";
}

export function formatToday() {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}


export function nextAvailableHour() {
  const date = new Date();
  date.setHours(date.getHours() + 1, 0, 0, 0);
  return `${String(date.getHours()).padStart(2, "0")}:00`;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
