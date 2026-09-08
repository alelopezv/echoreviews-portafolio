import { useState } from "react";
import Cropper from "react-easy-crop";
import { Check, CropIcon } from "lucide-react";
import type { Area } from "react-easy-crop";

interface Props {
  image: string;
  onCropConfirm: (area: Area) => void;
  /**
   * Ancho / alto del recorte. Lo decide quien use el editor, porque depende
   * del tipo de obra: un disco es cuadrado y un anime es un cartel vertical.
   * Antes estaba fijo en 2/3 y a los álbumes les cortaba media tapa.
   */
  aspect: number;
}

export function MediaPosterEditor({ image, onCropConfirm, aspect }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pendingArea, setPendingArea] = useState<Area | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (pendingArea) {
      onCropConfirm(pendingArea);
      setConfirmed(true);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Cropper */}
      <div className="relative w-full h-96 rounded-xl overflow-hidden border border-slate-700">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, croppedAreaPixels) => {
            setPendingArea(croppedAreaPixels);
            setConfirmed(false); // si mueve el crop, resetear confirmación
          }}
        />
      </div>

      {/* Zoom slider */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-xs text-slate-400">Zoom</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 accent-purple-500"
        />
        <span className="text-xs text-slate-400">{zoom.toFixed(1)}x</span>
      </div>

      {/* Botón confirmar */}
      <button
        type="button"
        onClick={handleConfirm}
        disabled={!pendingArea}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
          confirmed
            ? "bg-green-600 text-white"
            : "bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
        }`}
      >
        {confirmed ? (
          <>
            <Check className="w-4 h-4" />
            Recorte confirmado
          </>
        ) : (
          <>
            <CropIcon className="w-4 h-4" />
            Ajustar imagen
          </>
        )}
      </button>
    </div>
  );
}
