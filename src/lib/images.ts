const MAX_SIZE = 700;
const QUALITY = 0.72;

export async function fileToCompressedDataURL(file: File): Promise<string> {
  const dataUrl = await readAsDataURL(file);
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, MAX_SIZE / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", QUALITY);
}

export async function filesToDataURLs(files: FileList | File[]): Promise<string[]> {
  const accepted = Array.from(files).filter((f) => f.type.startsWith("image/"));
  const results: string[] = [];
  for (const f of accepted) {
    try {
      results.push(await fileToCompressedDataURL(f));
    } catch {
      // ignora archivos que no se puedan procesar
    }
  }
  return results;
}

export function estimateBytes(items: { images: string[] }[]): number {
  return items.reduce((acc, i) => acc + i.images.reduce((a, s) => a + s.length, 0), 0);
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = src;
  });
}