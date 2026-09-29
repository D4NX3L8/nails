import { LOGO_SIZES, MAX_IMAGE_BYTES, MAX_LOGO_BYTES } from "../config.js";

export function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo abrir una de las imágenes."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Una de las imágenes no se pudo procesar."));
      image.onload = () => {
        const scale = Math.min(1, 1400 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) return reject(new Error("No se pudo optimizar una de las imágenes."));
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        let quality = 0.82;
        const encode = () => canvas.toBlob((blob) => {
          if (!blob) return reject(new Error("No se pudo optimizar una de las imágenes."));
          if (blob.size > MAX_IMAGE_BYTES && quality > 0.42) {
            quality -= 0.1;
            encode();
            return;
          }
          if (blob.size > MAX_IMAGE_BYTES) {
            return reject(new Error("Una imagen sigue siendo muy pesada. Prueba con una imagen más pequeña."));
          }
          const output = new FileReader();
          output.onerror = () => reject(new Error("No se pudo guardar una de las imágenes."));
          output.onload = () => resolve(output.result);
          output.readAsDataURL(blob);
        }, "image/jpeg", quality);
        encode();
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export function processLogo(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Selecciona una imagen: PNG, JPG o WebP."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo abrir la imagen del logo."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("El archivo no es una imagen válida."));
      image.onload = () => {
        const attempt = (index) => {
          if (index >= LOGO_SIZES.length) {
            reject(new Error("El logo sigue siendo muy pesado. Prueba con una imagen más simple."));
            return;
          }

          const scale = Math.min(1, LOGO_SIZES[index] / Math.max(image.width, image.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          const context = canvas.getContext("2d");
          if (!context) {
            reject(new Error("No se pudo procesar el logo."));
            return;
          }
          context.drawImage(image, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error("No se pudo procesar el logo."));
              return;
            }
            if (blob.size > MAX_LOGO_BYTES && index + 1 < LOGO_SIZES.length) {
              attempt(index + 1);
              return;
            }
            if (blob.size > MAX_LOGO_BYTES) {
              reject(new Error("El logo sigue siendo muy pesado. Prueba con una imagen más simple."));
              return;
            }
            const output = new FileReader();
            output.onerror = () => reject(new Error("No se pudo guardar el logo."));
            output.onload = () => resolve(output.result);
            output.readAsDataURL(blob);
          }, "image/png");
        };

        attempt(0);
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}