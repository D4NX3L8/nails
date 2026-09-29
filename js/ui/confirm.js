import { elements } from "../dom.js";

let resolver = null;

function settle(result) {
  const resolve = resolver;
  resolver = null;
  resolve?.(result);
}

function cancel() {
  elements.confirmDialog.close();
  settle(false);
}

export function confirmAction({ title, message, acceptLabel = "Aceptar", danger = false }) {
  if (resolver) cancel();

  elements.confirmTitle.textContent = title;
  elements.confirmMessage.textContent = message;
  elements.confirmAccept.textContent = acceptLabel;
  elements.confirmAccept.classList.toggle("button-danger", danger);
  elements.confirmAccept.classList.toggle("button-primary", !danger);

  elements.confirmDialog.showModal();
  elements.confirmAccept.focus();

  return new Promise((resolve) => {
    resolver = resolve;
  });
}

export function initConfirmDialog() {
  elements.confirmCancel.addEventListener("click", cancel);
  elements.confirmAccept.addEventListener("click", () => {
    settle(true);
    elements.confirmDialog.close();
  });
  elements.confirmDialog.addEventListener("close", () => settle(false));
  elements.confirmDialog.addEventListener("click", (event) => {
    if (event.target === elements.confirmDialog) cancel();
  });
}
