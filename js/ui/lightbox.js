import { elements } from "../dom.js";

let images = [];
let index = 0;

function render() {
  const source = images[index];
  if (!source) return;
  elements.lightboxImage.src = source;
  elements.lightboxImage.alt = `Imagen de referencia ${index + 1}`;
  elements.lightboxCaption.textContent = images.length > 1
    ? `Imagen ${index + 1} de ${images.length}`
    : "";
  const single = images.length < 2;
  elements.lightboxPrev.hidden = single;
  elements.lightboxNext.hidden = single;
}

function step(delta) {
  if (images.length < 2) return;
  index = (index + delta + images.length) % images.length;
  render();
}

function onKeydown(event) {
  if (event.key === "ArrowLeft") step(-1);
  if (event.key === "ArrowRight") step(1);
}

export function openLightbox(sources, startIndex = 0) {
  images = [...sources];
  index = Math.max(0, Math.min(startIndex, images.length - 1));
  render();
  document.addEventListener("keydown", onKeydown);
  elements.lightbox.showModal();
}

export function initLightbox() {
  const close = () => {
    document.removeEventListener("keydown", onKeydown);
    elements.lightbox.close();
    elements.lightboxImage.removeAttribute("src");
  };

  elements.lightboxClose.addEventListener("click", close);
  elements.lightboxPrev.addEventListener("click", () => step(-1));
  elements.lightboxNext.addEventListener("click", () => step(1));
  elements.lightbox.addEventListener("click", (event) => {
    if (event.target === elements.lightbox) close();
  });
  elements.lightbox.addEventListener("close", () => document.removeEventListener("keydown", onKeydown));
}
