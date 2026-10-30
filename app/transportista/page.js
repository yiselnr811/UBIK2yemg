'use client';

import { useEffect, useState } from 'react';

const VEHICLES = [
  ['motorcycle', 'Motorina o motocicleta'],
  ['car', 'Automóvil'],
  ['van', 'Furgoneta'],
  ['truck', 'Camión'],
  ['bicycle', 'Bicicleta'],
  ['other', 'Otro'],
];

const MODES = [
  ['local', 'Dentro de mi municipio'],
  ['provincial', 'Dentro de mi provincia'],
  ['interprovincial', 'Entre provincias'],
];

const PROVINCES = [
  'Pinar del Río', 'Artemisa', 'La Habana', 'Mayabeque',
  'Matanzas', 'Villa Clara', 'Cienfuegos', 'Sancti Spíritus',
  'Ciego de Ávila', 'Camagüey', 'Las Tunas', 'Holguín',
  'Granma', 'Santiago de Cuba', 'Guantánamo', 'Isla de la Juventud',
];

export default function TransportistaPage() {
  const [token, setToken] = useState('');
  const [carrier, setCarrier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    vehicleType: 'motorcycle',
    vehiclePlate: '',
    province: '',
    municipalities: '',
    transportMode: 'local',
    experience: '',
    availability: '',
  });

  async function loadCarrier(authToken) {
    const response = await fetch('/api/carriers/me', {
      headers: { Authorization: `Bearer ${authToken}` },
      cache: 'no-store',
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'No se pudo consultar tu solicitud.');
    }

    setCarrier(data.carrier || null);
  }

  useEffect(() => {
    const savedToken = localStorage.getItem('ubik2_token');
    if (savedToken) {
      setToken(savedToken);
      loadCarrier(savedToken)
        .catch(error => setMessage(error.message))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  function update(field, value) {
    setForm(current => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setMessage('');

    const municipalities = form.municipalities
      .split(',')
      .map(value => value.trim())
      .filter(Boolean);

    if (!municipalities.length) {
      setMessage('Indica al menos un municipio de cobertura.');
      return;
    }

    setSending(true);

    try {
      const response = await fetch('/api/carriers/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, municipalities }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo enviar la solicitud.');
      }

      setMessage(data.message);
      await loadCarrier(token);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSending(false);
    }
  }

  const statusLabels = {
    pending: 'Pendiente de revisión',
    approved: 'Aprobado',
    active: 'Activo',
    rejected: 'Solicitud rechazada',
    suspended: 'Cuenta suspendida',
  };

  if (loading) {
    return <main className="min-h-screen p-6 flex items-center justify-center">Cargando...</main>;
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-50 p-5 flex items-center justify-center">
        <section className="max-w-md w-full bg-white rounded-2xl shadow p-6 text-center">
          <h1 className="text-2xl font-bold mb-3">Portal de transportistas</h1>
          <p className="text-slate-600 mb-5">Inicia sesión en UBIK2YEMG para solicitar tu inscripción.</p>
          <a href="/" className="inline-block rounded-xl bg-green-700 text-white px-6 py-3 font-semibold">
            Ir a UBIK2YEMG
          </a>
        </section>
      </main>
    );
  }

  if (carrier && carrier.status !== 'rejected') {
    return (
      <main className="min-h-screen bg-slate-50 p-5">
        <section className="max-w-xl mx-auto bg-white rounded-2xl shadow p-6">
          <a href="/" className="text-green-700 text-sm">← Volver a UBIK2YEMG</a>
          <h1 className="text-2xl font-bold mt-4 mb-5">Portal de transportistas</h1>
          <div className="rounded-xl bg-slate-100 p-4">
            <p className="text-sm text-slate-500">Estado de tu inscripción</p>
            <p className="text-xl font-bold mt-1">{statusLabels[carrier.status] || carrier.status}</p>
            {carrier.reviewNotes && (
              <p className="mt-3 text-sm">{carrier.reviewNotes}</p>
            )}
          </div>
          <p className="text-sm text-slate-600 mt-5">
            La inscripción no asigna envíos automáticamente. Las funciones operativas se habilitarán después de la aprobación y de las siguientes etapas del sistema.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <section className="max-w-xl mx-auto bg-white rounded-2xl shadow p-5 sm:p-7">
        <a href="/" className="text-green-700 text-sm">← Volver a UBIK2YEMG</a>
        <h1 className="text-2xl font-bold mt-4">Inscripción de transportistas</h1>
        <p className="text-slate-600 text-sm mt-2 mb-6">
          Registra tus datos para que UBIK pueda evaluar tu incorporación a la red de transporte.
        </p>

          {message && (
            <div role="status" className="rounded-xl bg-blue-50 text-blue-900 p-3 mb-4 text-sm">
              {message}
            </div>
          )}

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1">Nombre y apellidos *</span>
            <input required maxLength={100} value={form.fullName}
              onChange={e => update('fullName', e.target.value)}
              className="w-full border rounded-xl p-3" />
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1">Teléfono *</span>
            <input required type="tel" maxLength={20} value={form.phone}
              onChange={e => update('phone', e.target.value)}
              className="w-full border rounded-xl p-3" />
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1">Tipo de vehículo *</span>
            <select value={form.vehicleType} onChange={e => update('vehicleType', e.target.value)}
              className="w-full border rounded-xl p-3">
              {VEHICLES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1">Matrícula (si corresponde)</span>
            <input maxLength={30} value={form.vehiclePlate}
              onChange={e => update('vehiclePlate', e.target.value)}
              className="w-full border rounded-xl p-3" />
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1">Provincia principal *</span>
            <select required value={form.province} onChange={e => update('province', e.target.value)}
              className="w-full border rounded-xl p-3">
              <option value="">Selecciona tu provincia</option>
              {PROVINCES.map(province => <option key={province}>{province}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1">Municipios que cubres *</span>
            <input required maxLength={500} value={form.municipalities}
              onChange={e => update('municipalities', e.target.value)}
              placeholder="Ej.: Camagüey, Florida, Nuevitas"
              className="w-full border rounded-xl p-3" />
            <span className="text-xs text-slate-500">Separa los municipios con comas.</span>
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1">Modalidad de transporte *</span>
            <select value={form.transportMode} onChange={e => update('transportMode', e.target.value)}
              className="w-full border rounded-xl p-3">
              {MODES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1">Experiencia</span>
            <textarea maxLength={1000} value={form.experience}
              onChange={e => update('experience', e.target.value)}
              className="w-full border rounded-xl p-3" rows={3} />
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1">Disponibilidad</span>
            <textarea maxLength={300} value={form.availability}
              onChange={e => update('availability', e.target.value)}
              placeholder="Ej.: De lunes a sábado, de 8:00 a 17:00"
              className="w-full border rounded-xl p-3" rows={2} />
          </label>

          <button disabled={sending} type="submit"
            className="w-full rounded-xl bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-semibold p-3">
            {sending ? 'Enviando solicitud...' : 'Enviar solicitud de inscripción'}
          </button>
        </form>

        <p className="text-xs text-slate-500 mt-5">
          Tu solicitud será revisada por la administración. No podrás recibir ni gestionar envíos hasta contar con autorización.
        </p>
      </section>
    </main>
  );
}
