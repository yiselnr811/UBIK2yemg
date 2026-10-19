"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PublicInvoicePage() {
  const params = useParams();
  const token = Array.isArray(params?.token) ? params.token[0] : params?.token;
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    let active = true;
    fetch(`/api/public/invoices/${encodeURIComponent(token)}`, {
      cache: "no-store"
    })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "No se encontró la factura.");
        return result;
      })
      .then((result) => { if (active) setData(result); })
      .catch((err) => { if (active) setError(err.message || "Error al verificar."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const paymentLabels = {
    paid: "Pago confirmado",
    confirmed: "Pago confirmado",
    pending_payment: "Pendiente de pago",
    pending: "Pendiente",
    failed: "Pago fallido",
    cancelled: "Cancelado",
    refunded: "Reembolsado"
  };

  return (
    <main className="mx-auto max-w-2xl p-5 sm:p-8">
      <div className="rounded-xl border p-5 sm:p-7 space-y-4">
        <h1 className="text-2xl font-bold">Verificación de factura</h1>
        {loading && <p>Consultando factura…</p>}
        {!loading && error && (
          <div role="alert" className="rounded-md border border-red-300 p-3 text-red-700">
            {error}
          </div>
        )}
        {!loading && data && (
          <>
            <p className="text-green-700 font-semibold">✓ Factura válida</p>
            <p>Número: <strong>{data.invoiceNumber}</strong></p>
            <p>Negocio: <strong>{data.businessName}</strong></p>
            {data.createdAt && <p>Fecha: {new Date(data.createdAt).toLocaleString()}</p>}
            <div>
              <h2 className="font-semibold mb-2">Productos</h2>
              {data.items?.length ? (
                <ul className="space-y-2">
                  {data.items.map((item, index) => (
                    <li key={`${item.name}-${index}`} className="flex justify-between gap-3 border-b pb-2">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{Number(item.total).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              ) : <p>Sin detalle de productos disponible.</p>}
            </div>
            <p className="text-lg">Total: <strong>{Number(data.total).toFixed(2)} {data.currency}</strong></p>
            <div className="rounded-md border p-3">
              <p>Estado del pago: <strong>{paymentLabels[data.paymentStatus] || data.paymentStatus}</strong></p>
              {data.crypto && (
                <p className="text-sm mt-1">
                  Factura cripto: {data.crypto.status}
                  {data.crypto.network ? ` · ${data.crypto.network}` : ""}
                </p>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Esta consulta verifica que la factura existe en UBIK2YEMG.
              La validez de la factura no significa necesariamente que el pago
              esté confirmado. Escanear el QR no aprueba pagos ni libera fondos.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
