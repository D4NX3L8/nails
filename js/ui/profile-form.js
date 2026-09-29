import { BRAND } from "../config.js";
import { elements } from "../dom.js";
import { getSettings } from "../data/appointment-storage.js";
import { processLogo } from "../services/image-processing.js";

export function createProfileForm({ onSubmit }) {
  let draftLogo = null;

  function paintPreview(name, logo) {
    const hasCustomLogo = typeof logo === "string" && logo.length > 0;
    elements.previewName.textContent = (name || "").trim() || BRAND.name;
    elements.previewMark.classList.toggle("is-custom", hasCustomLogo);
    elements.previewLogo.src = hasCustomLogo ? logo : BRAND.logo;
    elements.resetLogo.hidden = !hasCustomLogo;
    elements.logoState.textContent = hasCustomLogo ? "Logo personalizado" : "Opcional";
    elements.logoAction.textContent = hasCustomLogo ? "Reemplazar mi logo" : "Agregar tu logo";
  }

  function open() {
    const settings = getSettings();
    draftLogo = settings.logo || null;
    elements.profileError.textContent = "";
    elements.profileName.value = settings.businessName || BRAND.name;
    paintPreview(elements.profileName.value, draftLogo);
    elements.profileDialog.showModal();
    elements.profileName.focus();
    elements.profileName.select();
  }

  elements.profileName.addEventListener("input", () => {
    paintPreview(elements.profileName.value, draftLogo);
  });

  elements.profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const businessName = elements.profileName.value.trim();

    if (!businessName) {
      elements.profileError.textContent = "Escribe el nombre que quieres que aparezca arriba.";
      elements.profileName.setAttribute("aria-invalid", "true");
      elements.profileName.focus();
      return;
    }

    elements.profileSave.disabled = true;
    try {
      onSubmit({ businessName, logo: draftLogo });
      elements.profileDialog.close();
    } catch (error) {
      elements.profileError.textContent = error.message;
    } finally {
      elements.profileSave.disabled = false;
    }
  });

  elements.logoInput.addEventListener("change", async () => {
    const [file] = [...elements.logoInput.files];
    elements.logoInput.value = "";
    if (!file) return;

    elements.profileError.textContent = "";
    elements.logoInput.disabled = true;
    elements.logoAction.textContent = "Procesando…";
    try {
      draftLogo = await processLogo(file);
      paintPreview(elements.profileName.value, draftLogo);
    } catch (error) {
      elements.profileError.textContent = error.message;
    } finally {
      elements.logoInput.disabled = false;
      elements.logoAction.textContent = draftLogo ? "Reemplazar mi logo" : "Agregar tu logo";
    }
  });

  elements.resetLogo.addEventListener("click", () => {
    draftLogo = null;
    elements.profileError.textContent = "";
    paintPreview(elements.profileName.value, draftLogo);
  });

  elements.profileClose.addEventListener("click", () => elements.profileDialog.close());
  elements.profileCancel.addEventListener("click", () => elements.profileDialog.close());
  elements.profileDialog.addEventListener("click", (event) => {
    if (event.target === elements.profileDialog) elements.profileDialog.close();
  });

  return { open };
}
