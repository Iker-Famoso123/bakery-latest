import type { Horario, SettingsDto, SocialLink } from '@rf/types';
import { type FormEvent, useState } from 'react';
import { IconPlus, IconX } from '../../components/icons';
import { Button, Card, Field, Input, PageHeader, Spinner } from '../../components/ui';
import { ApiError } from '../../lib/api';
import { toast } from '../../stores/toast';
import { useSaveSettings, useSettings, type SettingsInput } from './api';
import { HorariosEditor } from './HorariosEditor';

export function SettingsPage() {
  const { data, isLoading } = useSettings();
  if (isLoading) {
    return (
      <div className="grid place-items-center py-16 text-concha">
        <Spinner className="size-6" />
      </div>
    );
  }
  return <SettingsForm settings={data} />;
}

function SettingsForm({ settings }: { settings?: SettingsDto }) {
  const save = useSaveSettings();
  const [whatsapp, setWhatsapp] = useState(settings?.whatsapp ?? '');
  const [telefono, setTelefono] = useState(settings?.telefono ?? '');
  const [direccion, setDireccion] = useState(settings?.direccion ?? '');
  const [lat, setLat] = useState(settings?.lat != null ? String(settings.lat) : '');
  const [lng, setLng] = useState(settings?.lng != null ? String(settings.lng) : '');
  const [redes, setRedes] = useState<SocialLink[]>(settings?.redes ?? []);
  const [horarios, setHorarios] = useState<Horario[]>(settings?.horarios ?? []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const input: SettingsInput = {
      whatsapp: whatsapp.trim() || null,
      telefono: telefono.trim() || null,
      direccion: direccion.trim() || null,
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null,
      redes: redes.filter((r) => r.tipo.trim() && r.url.trim()),
      // El editor ya entrega filas completas y limpias.
      horarios,
    };
    try {
      await save.mutateAsync(input);
      toast.ok('Información guardada');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'No se pudo guardar');
    }
  }

  return (
    <>
      <PageHeader title="Información del sitio" subtitle="Contacto, redes y horarios del About." />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card className="flex flex-col gap-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="WhatsApp">
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+52 33 1234 5678" />
            </Field>
            <Field label="Teléfono">
              <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            </Field>
          </div>
          <Field label="Dirección">
            <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Latitud" hint="Para el mapa. Opcional.">
              <Input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="20.6597" />
            </Field>
            <Field label="Longitud">
              <Input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="-103.3496" />
            </Field>
          </div>
        </Card>

        {/* Redes sociales */}
        <Card className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-cafe">Redes sociales</h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setRedes((r) => [...r, { tipo: '', url: '' }])}
            >
              <IconPlus className="size-4" /> Agregar
            </Button>
          </div>
          {redes.length === 0 ? (
            <p className="text-sm text-tenue">Sin redes todavía.</p>
          ) : (
            redes.map((red, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  className="w-40"
                  placeholder="Facebook"
                  value={red.tipo}
                  onChange={(e) =>
                    setRedes((r) => r.map((x, j) => (j === i ? { ...x, tipo: e.target.value } : x)))
                  }
                />
                <Input
                  placeholder="https://…"
                  value={red.url}
                  onChange={(e) =>
                    setRedes((r) => r.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))
                  }
                />
                <RemoveButton onClick={() => setRedes((r) => r.filter((_, j) => j !== i))} />
              </div>
            ))
          )}
        </Card>

        {/* Horarios — días flexibles con chips + rango de horas */}
        <Card className="p-5">
          <HorariosEditor initial={settings?.horarios ?? []} onChange={setHorarios} />
        </Card>

        <div>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg p-2 text-cafe-suave hover:bg-peligro-tenue hover:text-peligro"
      aria-label="Quitar"
    >
      <IconX className="size-5" />
    </button>
  );
}
