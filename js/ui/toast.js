import { elements } from "../dom.js";

const ICONS = { success: "icon-check", error: "icon-close", info: "icon-sparkle" };
const DURATION = 4200;
const active = new Set();

function remove(toast) {
  if (!active.has(toast)) return;
  active.delete(toast);
  clearTimeout(Number(toast.dataset.timer));
  toast.classList.add("is-leaving");
  toast.addEventListener("animationend", () => toast.remove(), { once: true });
  setTimeout(() => toast.remove(), 400);
}

export function notify(message, { type = "info", action = null, duration = DURATION } = {}) {
  while (active.size >= 3) remove(active.values().next().value);

  const toast = document.createElement("div");
  toast.className = `toast is-${type}`;
  toast.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#${ICONS[type] || ICONS.info}" /></svg><p></p>`;
  toast.querySelector("p").textContent = message;

  if (action?.label) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "toast-action";
    button.textContent = action.label;
    button.addEventListener("click", () => {
      remove(toast);
      action.onClick?.();
    });
    toast.append(button);
  }

  elements.toastStack.append(toast);
  active.add(toast);
  toast.dataset.timer = setTimeout(() => remove(toast), duration);
  return toast;
}
