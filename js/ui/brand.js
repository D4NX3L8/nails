import { BRAND } from "../config.js";
import { elements } from "../dom.js";
import { getSettings } from "../data/appointment-storage.js";

export function applyBrand({ businessName, logo } = getSettings()) {
  const name = (businessName || "").trim() || BRAND.name;
  const hasCustomLogo = typeof logo === "string" && logo.length > 0;

  elements.brandMark.classList.toggle("is-custom", hasCustomLogo);
  elements.brandLogo.src = hasCustomLogo ? logo : BRAND.logo;
  elements.brandLogo.alt = "";
  elements.brandName.textContent = name;
  elements.brandLink.setAttribute("aria-label", `${name}, inicio de la agenda`);

  elements.footerName.textContent = name;
  elements.footerLogo.hidden = hasCustomLogo;

  document.title = `${name} · Agenda de citas`;
}
