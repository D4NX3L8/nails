import { useCallback, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function Lightbox({ images, index, onClose }: { images: string[]; index: number; onClose: () => void }) {
  const [i, setI] = useState(index);
  const go = useCallback(
    (dir: number) => setI((cur) => (cur + dir + images.length) % images.length),
    [images.length]
  );

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/85 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        aria-label="Cerrar galería"
      >
        <X size={20} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          go(-1);
        }}
        className="absolute left-3 sm:left-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        aria-label="Anterior"
      >
        <ChevronLeft size={20} />
      </button>
      <div
        className="px-14 sm:px-24 w-full flex justify-center animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[i]}
          alt={`Referencia ${i + 1}`}
          className="max-h-[80vh] max-w-full rounded-2xl shadow-2xl object-contain"
        />
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          go(1);
        }}
        className="absolute right-3 sm:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        aria-label="Siguiente"
      >
        <ChevronRight size={20} />
      </button>
      <span className="absolute bottom-5 text-xs font-semibold text-white/70 bg-white/10 rounded-full px-3 py-1">
        {i + 1} / {images.length}
      </span>
    </div>
  );
}