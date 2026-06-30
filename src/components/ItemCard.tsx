"use client";

import { useState } from "react";
import { QrCode, ChevronDown, ChevronUp, Printer, Tag } from "lucide-react";
import { Item } from "@/lib/supabase";
import { generateQRDataUrl } from "@/lib/qr";

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [loadingQr, setLoadingQr] = useState(false);

  const cat = item.categoria;
  const attrs = item.atributos ?? {};

  async function getQr(): Promise<string> {
    if (qrSrc) return qrSrc;
    const src = await generateQRDataUrl(item.id);
    setQrSrc(src);
    return src;
  }

  async function handleToggleQr() {
    if (showQr) { setShowQr(false); return; }
    setLoadingQr(true);
    await getQr();
    setLoadingQr(false);
    setShowQr(true);
  }

  async function handlePrint() {
    const src = await getQr();
    const win = window.open("", "_blank");
    if (!win) return;

    const attrRows = Object.entries(attrs)
      .map(([k, v]) => {
        const campo = cat?.campos?.find(c => c.nombre === k);
        const label = campo?.label ?? k;
        return `<div class="row"><span>${label}: </span>${v}</div>`;
      }).join("");

    win.document.write(`
      <!DOCTYPE html><html><head><meta charset="utf-8"/><title>Etiqueta</title>
      <style>
        @page { size: A4; margin: 10mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: Arial, sans-serif; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8mm; }
        .label { border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 5mm; display: flex; align-items: center; gap: 4mm; page-break-inside: avoid; }
        .qr img { width: 28mm; height: 28mm; display: block; }
        .info { flex: 1; }
        .cat { font-size: 8pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 1mm; }
        .nombre { font-size: 13pt; font-weight: bold; color: #0f172a; margin-bottom: 2mm; }
        .row { font-size: 9pt; color: #334155; margin-bottom: 0.5mm; }
        .row span { color: #94a3b8; }
        .badge { display: inline-block; font-size: 7pt; padding: 1px 5px; border-radius: 20px; background: #dcfce7; color: #16a34a; font-weight: bold; margin-bottom: 2mm; }
        .id { font-size: 7pt; color: #94a3b8; font-family: monospace; margin-top: 2mm; }
      </style></head><body>
      <div class="grid">
        <div class="label">
          <div class="qr"><img src="${src}" /></div>
          <div class="info">
            <div class="cat">${cat?.icono ?? "📦"} ${cat?.nombre ?? "Ítem"}</div>
            <div class="nombre">${Object.values(attrs)[0] ?? "Ítem"}</div>
            <div class="badge">Disponible</div>
            ${attrRows}
            <div class="id">#${item.id.slice(0, 12)}</div>
          </div>
        </div>
      </div>
      <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body></html>
    `);
    win.document.close();
  }

  const disponible = item.estado === "disponible";
  const fechaCreacion = new Date(item.fecha_creacion).toLocaleDateString("es-CL");
  const fechaUso = item.fecha_uso ? new Date(item.fecha_uso).toLocaleDateString("es-CL") : null;

  // Primera línea de atributos como título de la card
  const titulo = Object.values(attrs)[0] ?? "Sin nombre";
  const resto = Object.entries(attrs).slice(1);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-xs">{cat?.icono ?? "📦"}</span>
              <span className="text-xs text-slate-400 font-medium">{cat?.nombre}</span>
            </div>
            <h3 className="font-semibold text-slate-800 capitalize truncate">{titulo}</h3>
          </div>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
            disponible ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${disponible ? "bg-emerald-500" : "bg-slate-400"}`} />
            {disponible ? "Disponible" : "Usado"}
          </span>
        </div>

        {/* Atributos */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm mb-4">
          {resto.map(([k, v]) => {
            const campo = cat?.campos?.find(c => c.nombre === k);
            return (
              <div key={k}>
                <p className="text-xs text-slate-400">{campo?.label ?? k}</p>
                <p className="font-medium text-slate-700 capitalize truncate">{v}</p>
              </div>
            );
          })}
          <div>
            <p className="text-xs text-slate-400">Creado</p>
            <p className="font-medium text-slate-700">{fechaCreacion}</p>
          </div>
          {fechaUso && (
            <div>
              <p className="text-xs text-slate-400">Usado</p>
              <p className="font-medium text-slate-700">{fechaUso}</p>
            </div>
          )}
        </div>

        {/* Acciones */}
        {disponible && (
          <div className="flex gap-2">
            <button
              onClick={handleToggleQr}
              disabled={loadingQr}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-sky-500 text-sky-600 text-sm font-medium hover:bg-sky-50 transition-colors disabled:opacity-50"
            >
              <QrCode size={15} />
              {loadingQr ? "..." : showQr ? "Ocultar" : "Ver QR"}
              {!loadingQr && (showQr ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
              title="Imprimir etiqueta"
            >
              <Printer size={15} />
              Imprimir
            </button>
          </div>
        )}
      </div>

      {/* QR expandido */}
      {showQr && qrSrc && (
        <div className="border-t border-slate-100 p-4 flex flex-col items-center gap-2 bg-slate-50">
          <img src={qrSrc} alt="QR" className="w-36 h-36" />
          <p className="text-xs text-slate-400">Escanea para marcar como usado</p>
          <a href={qrSrc} download={`item-${item.id.slice(0, 8)}.png`} className="text-xs text-sky-600 underline">
            Descargar imagen
          </a>
        </div>
      )}
    </div>
  );
}
