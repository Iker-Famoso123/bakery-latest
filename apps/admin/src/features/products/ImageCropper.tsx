import type { ProductImage } from '@rf/types';
import { useCallback, useEffect, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Modal, ModalActions } from '../../components/Modal';
import { Button } from '../../components/ui';
import { ApiError } from '../../lib/api';
import { toast } from '../../stores/toast';
import { useUploadImage } from './api';

interface Props {
  file: File;
  onUploaded: (image: ProductImage) => void;
  onClose: () => void;
}

/** Modal de recorte: el usuario ajusta el encuadre y se sube a R2 vía la API. */
export function ImageCropper({ file, onUploaded, onClose }: Props) {
  const [url, setUrl] = useState<string>('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const upload = useUploadImage();

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setArea(areaPixels);
  }, []);

  async function handleUpload() {
    if (!area) return;
    try {
      const image = await upload.mutateAsync({
        file,
        crop: { x: area.x, y: area.y, width: area.width, height: area.height },
      });
      toast.ok('Foto subida');
      onUploaded(image);
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.status === 503) {
        toast.error('Configura R2 en la API para poder subir fotos');
      } else {
        toast.error(err instanceof ApiError ? err.message : 'No se pudo subir la foto');
      }
    }
  }

  return (
    <Modal open onClose={onClose} title="Recortar foto" size="lg" locked={upload.isPending}>
      <div className="relative h-72 touch-none bg-cafe">
        {url ? (
          <Cropper
            image={url}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        ) : null}
      </div>

      <label className="flex items-center gap-3 px-5 pb-2 pt-4 text-sm text-cafe-suave">
        Zoom
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 accent-[var(--color-concha)]"
        />
      </label>
      <ModalActions>
        <Button variant="ghost" onClick={onClose} type="button" disabled={upload.isPending}>
          Cancelar
        </Button>
        <Button onClick={handleUpload} disabled={upload.isPending || !area} type="button">
          {upload.isPending ? 'Subiendo…' : 'Usar foto'}
        </Button>
      </ModalActions>
    </Modal>
  );
}
