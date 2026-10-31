'use client';

import { useEffect, useState } from 'react';
import {
  CUBA_PROVINCES,
  getCubanMunicipalities,
} from '@/lib/cuba-locations';

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

export default function TransportistaPage() {
  const [token, setToken] = useState('');
  const [carrier, setCarrier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [availableServices, setAvailableServices] = useState([]);
  const [assignedServices, setAssignedServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [serviceMessage, setServiceMessage] = useState('');
  const [serviceAction, setServiceAction] = useState('');
  const [coverageAreas, setCoverageAreas] = useState([
    { province: '', municipalities: [] },
  ]);
  const [form, setForm] = useState({
    identityNumber: '',
    fullName: '',
    phone: '',
    addressProvince: '',
    addressMunicipality: '',
    addressLocality: '',
    addressStreet: '',
    addressReference: '',
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

    const savedCarrier = data.carrier || null;
    setCarrier(savedCarrier);

    if (savedCarrier) {
      const savedAreas = Array.isArray(savedCarrier.coverageAreas) &&
        savedCarrier.coverageAreas.length
        ? savedCarrier.coverageAreas
        : [{
            province: savedCarrier.province || '',
            municipalities: savedCarrier.municipalities || [],
          }];

      setCoverageAreas(savedAreas.map(area => ({
        province: area.province || '',
        municipalities: Array.isArray(area.municipalities)
          ? area.municipalities
          : [],
      })));

      setForm(current => ({
        ...current,
        identityNumber: savedCarrier.identityNumber || '',
        fullName: savedCarrier.fullName || '',
        phone: savedCarrier.phone || '',
        addressProvince: savedCarrier.addressProvince || '',
        addressMunicipality: savedCarrier.addressMunicipality || '',
        addressLocality: savedCarrier.addressLocality || '',
        addressStreet: savedCarrier.addressStreet || '',
        addressReference: savedCarrier.addressReference || '',
        vehicleType: savedCarrier.vehicleType || 'motorcycle',
        vehiclePlate: savedCarrier.vehiclePlate || '',
        province: savedCarrier.province || '',
        municipalities: Array.isArray(savedCarrier.municipalities)
          ? savedCarrier.municipalities.join(', ')
          : '',
        transportMode: savedCarrier.transportMode || 'local',
        experience: savedCarrier.experience || '',
        availability: savedCarrier.availability || '',
      }));
    }
  }

  async function loadServices(authToken) {
    setServicesLoading(true);

    try {
      const response = await fetch('/api/carriers/services', {
        headers: { Authorization: `Bearer ${authToken}` },
        cache: 'no-store',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudieron cargar los servicios.');
      }

      setAvailableServices(
        Array.isArray(data.availableServices) ? data.availableServices : []
      );
      setAssignedServices(
        Array.isArray(data.assignedServices) ? data.assignedServices : []
      );
    } catch (error) {
      setServiceMessage(error.message);
    } finally {
      setServicesLoading(false);
    }
  }

  async function performServiceAction(orderId, action) {
    const actionKey = `${orderId}:${action}`;
    setServiceAction(actionKey);
    setServiceMessage('');

    try {
      const options = {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      };

      if (action === 'accepted' || action === 'rejected') {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify({ action });
      }

      const response = await fetch(
        `/api/carriers/orders/${encodeURIComponent(orderId)}/${action === 'accepted' || action === 'rejected' ? 'respond' : action}`,
        options
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo actualizar el servicio.');
      }

      const successMessages = {
        accepted: 'Servicio aceptado correctamente.',
        rejected: 'Has rechazado el servicio.',
        pickup: 'Recogida confirmada correctamente.',
        deliver: 'Entrega al destinatario confirmada.',
      };

      setServiceMessage(successMessages[action] || 'Servicio actualizado.');
      await loadServices(token);
    } catch (error) {
      setServiceMessage(error.message);
      await loadServices(token);
    } finally {
      setServiceAction('');
    }
  }

  useEffect(() => {
    if (token && carrier?.status === 'approved') {
      loadServices(token);
    }
  }, [token, carrier?.status]);

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

  function updateCoverageProvince(index, province) {
    setCoverageAreas(current => current.map((area, i) =>
      i === index ? { province, municipalities: [] } : area
    ));
  }

  function toggleCoverageMunicipality(index, municipality) {
    setCoverageAreas(current => current.map((area, i) => {
      if (i !== index) return area;
      const selected = area.municipalities.includes(municipality);
      return {
        ...area,
        municipalities: selected
          ? area.municipalities.filter(value => value !== municipality)
          : [...area.municipalities, municipality],
      };
    }));
  }

  function addCoverageArea() {
    setCoverageAreas(current =>
      current.length >= 16
        ? current
        : [...current, { province: '', municipalities: [] }]
    );
  }

  function removeCoverageArea(index) {
    setCoverageAreas(current =>
      current.length <= 1
        ? current
        : current.filter((_, i) => i !== index)
    );
  }

  async function submit(event) {
    event.preventDefault();
    setMessage('');

    if (
      !coverageAreas.length ||
      coverageAreas.some(area =>
        !area.province || !area.municipalities.length
      )
    ) {
      setMessage('Selecciona una provincia y al menos un municipio en cada zona.');
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
        body: JSON.stringify({
          ...form,
          province: coverageAreas[0].province,
          municipalities: coverageAreas[0].municipalities,
          coverageAreas,
        }),
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
            {carrier.applicationNumber && (
              <p className="text-sm font-semibold text-green-800 mb-2">
                Número de solicitud: {carrier.applicationNumber}
              </p>
            )}
            <p className="text-sm text-slate-500">Estado de tu inscripción</p>
            <p className="text-xl font-bold mt-1">{statusLabels[carrier.status] || carrier.status}</p>
            {carrier.reviewNotes && (
              <p className="mt-3 text-sm">{carrier.reviewNotes}</p>
            )}
          </div>
          {carrier.status === 'approved' && (
            <div className="mt-6 space-y-6">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-bold">Servicios de transporte</h2>
                  <button
                    type="button"
                    onClick={() => loadServices(token)}
                    disabled={servicesLoading}
                    className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
                  >
                    {servicesLoading ? 'Actualizando...' : 'Actualizar'}
                  </button>
                </div>

                {serviceMessage && (
                  <p role="status" className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
                    {serviceMessage}
                  </p>
                )}
              </div>

              <section className="space-y-3">
                <h3 className="font-bold text-lg">
                  Servicios disponibles ({availableServices.length})
                </h3>

                {availableServices.length === 0 && (
                  <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    No hay servicios disponibles para tus zonas de cobertura en este momento.
                  </p>
                )}

                {availableServices.map(service => (
                  <article key={service.orderId} className="rounded-xl border p-4 space-y-3">
                    <div className="flex justify-between gap-2">
                      <span className="font-semibold">
                        Pedido #{service.orderId}
                      </span>
                      <span className="text-xs rounded-full bg-green-100 text-green-800 px-2 py-1">
                        Disponible
                      </span>
                    </div>

                    <p className="text-sm">
                      <strong>Negocio:</strong> {service.businessName || 'No indicado'}
                    </p>
                    <div className="text-sm space-y-1">
                      <p><strong>Origen:</strong> {service.origin?.municipality}, {service.origin?.province}</p>
                      <p><strong>Destino:</strong> {service.destination?.municipality}, {service.destination?.province}</p>
                      <p><strong>Modalidad:</strong> {service.routeType || 'No indicada'}</p>
                    </div>

                    {service.items?.length > 0 && (
                      <div className="text-sm">
                        <strong>Productos:</strong>
                        <ul className="list-disc pl-5 mt-1">
                          {service.items.map((item, index) => (
                            <li key={index}>{item.name} × {item.quantity}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {service.totalCUP != null && (
                      <p className="font-semibold">
                        Total del pedido: {Number(service.totalCUP).toLocaleString('es-CU')} CUP
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={!!serviceAction}
                        onClick={() => performServiceAction(service.orderId, 'accepted')}
                        className="rounded-lg bg-green-700 text-white p-3 text-sm font-semibold disabled:opacity-50"
                      >
                        {serviceAction === `${service.orderId}:accepted` ? 'Aceptando...' : 'Aceptar'}
                      </button>
                      <button
                        type="button"
                        disabled={!!serviceAction}
                        onClick={() => performServiceAction(service.orderId, 'rejected')}
                        className="rounded-lg bg-red-50 text-red-700 p-3 text-sm font-semibold disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                    </div>
                  </article>
                ))}
              </section>

              <section className="space-y-3">
                <h3 className="font-bold text-lg">
                  Mis pedidos asignados ({assignedServices.length})
                </h3>

                {assignedServices.length === 0 && (
                  <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    Todavía no tienes pedidos asignados.
                  </p>
                )}

                {assignedServices.map(service => (
                  <article key={service.orderId} className="rounded-xl border p-4 space-y-3">
                    <div className="flex justify-between gap-2">
                      <strong>Pedido #{service.orderId}</strong>
                      <span className="text-xs rounded-full bg-blue-100 text-blue-800 px-2 py-1">
                        {({
                          accepted: 'Aceptado',
                          picked_up: 'Recogido',
                          delivered: 'Entregado',
                        })[service.status] || service.status}
                      </span>
                    </div>

                    <div className="text-sm space-y-1">
                      <p><strong>Recogida:</strong> {service.origin?.address || 'Dirección no indicada'}</p>
                      <p>{service.origin?.municipality}, {service.origin?.province}</p>
                      <hr className="my-2" />
                      <p><strong>Destinatario:</strong> {service.recipient?.name || 'No indicado'}</p>
                      <p><strong>Teléfono:</strong> {service.recipient?.phone || 'No indicado'}</p>
                      <p><strong>Dirección de entrega:</strong> {service.recipient?.address || 'No indicada'}</p>
                      <p>{service.recipient?.municipality}, {service.recipient?.province}</p>
                      {service.recipient?.notes && (
                        <p><strong>Indicaciones:</strong> {service.recipient.notes}</p>
                      )}
                    </div>

                    {service.items?.length > 0 && (
                      <div className="text-sm">
                        <strong>Productos:</strong>
                        <ul className="list-disc pl-5 mt-1">
                          {service.items.map((item, index) => (
                            <li key={index}>{item.name} × {item.quantity}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {service.status === 'accepted' && (
                      <button
                        type="button"
                        disabled={!!serviceAction}
                        onClick={() => performServiceAction(service.orderId, 'pickup')}
                        className="w-full rounded-lg bg-blue-700 text-white p-3 font-semibold disabled:opacity-50"
                      >
                        {serviceAction === `${service.orderId}:pickup` ? 'Confirmando...' : 'Confirmar recogida'}
                      </button>
                    )}

                    {service.status === 'picked_up' && (
                      <button
                        type="button"
                        disabled={!!serviceAction}
                        onClick={() => performServiceAction(service.orderId, 'deliver')}
                        className="w-full rounded-lg bg-green-700 text-white p-3 font-semibold disabled:opacity-50"
                      >
                        {serviceAction === `${service.orderId}:deliver` ? 'Confirmando...' : 'Confirmar entrega'}
                      </button>
                    )}

                    {service.status === 'delivered' && (
                      <p className="rounded-lg bg-green-50 text-green-800 p-3 text-sm font-medium">
                        Transporte finalizado. Las confirmaciones de vendedor y comprador siguen su propio proceso.
                      </p>
                    )}
                  </article>
                ))}
              </section>
            </div>
          )}

          {carrier.status !== 'approved' && (
            <p className="text-sm text-slate-600 mt-5">
              Las funciones operativas estarán disponibles después de la aprobación administrativa.
            </p>
          )}
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
          <div className="rounded-xl bg-amber-50 text-amber-900 p-3 text-sm">
            Los datos de identidad y domicilio son privados. Se utilizarán
            exclusivamente para revisar y gestionar tu inscripción.
          </div>

          <label className="block">
            <span className="block text-sm font-medium mb-1">Carnet de identidad cubano *</span>
            <input required inputMode="numeric" pattern="[0-9]{11}"
              minLength={11} maxLength={11}
              value={form.identityNumber}
              onChange={e => update('identityNumber', e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="11 dígitos"
              className="w-full border rounded-xl p-3" />
          </label>

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

          <h2 className="text-lg font-bold pt-3">Domicilio particular</h2>

          <label className="block">
            <span className="block text-sm font-medium mb-1">Provincia de residencia *</span>
            <select required value={form.addressProvince}
              onChange={e => update('addressProvince', e.target.value)}
              className="w-full border rounded-xl p-3">
              <option value="">Selecciona tu provincia</option>
              {CUBA_PROVINCES.map(province => <option key={province}>{province}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1">Municipio de residencia *</span>
            <input required maxLength={80} value={form.addressMunicipality}
              onChange={e => update('addressMunicipality', e.target.value)}
              className="w-full border rounded-xl p-3" />
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1">Localidad o reparto *</span>
            <input required maxLength={100} value={form.addressLocality}
              onChange={e => update('addressLocality', e.target.value)}
              className="w-full border rounded-xl p-3" />
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1">Calle y número de vivienda *</span>
            <input required maxLength={150} value={form.addressStreet}
              onChange={e => update('addressStreet', e.target.value)}
              placeholder="Ej.: Calle Martí #25"
              className="w-full border rounded-xl p-3" />
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1">Entre calles o referencia</span>
            <textarea maxLength={200} value={form.addressReference}
              onChange={e => update('addressReference', e.target.value)}
              placeholder="Referencia para localizar el domicilio"
              className="w-full border rounded-xl p-3" rows={2} />
          </label>

          <h2 className="text-lg font-bold pt-3">Vehículo y cobertura de transporte</h2>

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

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Zonas donde prestarás servicios *</h3>
              <p className="text-sm text-slate-500">
                Puedes seleccionar varias provincias y los municipios que atenderás en cada una.
              </p>
            </div>

            {coverageAreas.map((area, index) => (
              <section key={index} className="border rounded-xl p-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">Zona {index + 1}</span>
                  {coverageAreas.length > 1 && (
                    <button type="button"
                      onClick={() => removeCoverageArea(index)}
                      className="text-sm text-red-600">
                      Eliminar zona
                    </button>
                  )}
                </div>

                <label className="block">
                  <span className="block text-sm font-medium mb-1">Provincia *</span>
                  <select required value={area.province}
                    onChange={e => updateCoverageProvince(index, e.target.value)}
                    className="w-full border rounded-xl p-3">
                    <option value="">Selecciona una provincia</option>
                    {CUBA_PROVINCES.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </label>

                {area.province && (
                  <fieldset className="space-y-2">
                    <legend className="text-sm font-medium">
                      Municipios que cubres *
                    </legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getCubanMunicipalities(area.province).map(municipality => (
                        <label key={municipality}
                          className="flex items-center gap-2 rounded-lg border p-2">
                          <input type="checkbox"
                            checked={area.municipalities.includes(municipality)}
                            onChange={() =>
                              toggleCoverageMunicipality(index, municipality)
                            } />
                          <span className="text-sm">{municipality}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">
                      Seleccionados: {area.municipalities.length}
                    </p>
                  </fieldset>
                )}
              </section>
            ))}

            <button type="button" onClick={addCoverageArea}
              disabled={coverageAreas.length >= 16}
              className="rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-50">
              + Añadir otra provincia
            </button>
          </div>

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
