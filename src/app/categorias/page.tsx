"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Tag, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/AppShell";
import { Categoria, CampoSchema } from "@/lib/supabase";

const TIPOS_CAMPO = [
  { value: "text", label: "Texto libre" },
  { value: "select", label: "Lista de opciones" },
  { value: "number", label: "Número" },
];

const ICONOS = ["📦", "🪟", "🧵", "🎨", "📐", "🔩", "🏷️", "📋", "🛒", "🪜"];
const COLORES_PRESET = ["#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

export default function CategoriasPage() {
  const { user } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [nombre, setNombre] = useState("");
  const [icono, setIcono] = useState("📦");
  const [color, setColor] = useState("#0ea5e9");
  const [campos, setCampos] = useState<CampoSchema[]>([
    { nombre: "nombre", label: "Nombre", tipo: "text", requerido: true }
  ]);

  const fetchCategorias = useCallback(async () => {
    const res = await fetch("/api/categorias");
    if (res.ok) setCategorias(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategorias(); }, [fetchCategorias]);

  function addCampo() {
    setCampos(prev => [...prev, { nombre: "", label: "", tipo: "text", requerido: false }]);
  }

  function updateCampo(idx: number, key: keyof CampoSchema, value: string | boolean | string[]) {
    setCampos(prev => prev.map((c, i) => {
      if (i !== idx) return c;
      const updated = { ...c, [key]: value };
      if (key === "label") updated.nombre = (value as string).toLowerCase().replace(/\s+/g, "_");
      return updated;
    }));
  }

  function removeCampo(idx: number) {
    setCampos(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!nombre.trim()) { setError("El nombre es requerido"); return; }
    if (campos.some(c => !c.label.trim())) { setError("Todos los campos deben tener un nombre"); return; }

    setSaving(true);
    const res = await fetch("/api/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombre.trim(), icono, color, campos }),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Error al guardar");
      setSaving(false);
      return;
    }

    setNombre(""); setIcono("📦"); setColor("#0ea5e9");
    setCampos([{ nombre: "nombre", label: "Nombre", tipo: "text", requerido: true }]);
    setShowForm(false);
    fetchCategorias();
    setSaving(false);
  }

  return (
    <AppShell>
      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="lg:hidden text-lg font-bold text-slate-800">Categorías</h2>
            <p className="text-sm text-slate-400">{categorias.length} categorías configuradas</p>
          </div>
          {user && (
            <button
              onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 text-white font-semibold text-sm hover:bg-sky-700 transition-all shadow-sm"
            >
              <Plus size={16} />
              {showForm ? "Cancelar" : "Nueva categoría"}
            </button>
          )}
        </div>

        {/* Formulario nueva categoría */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-slate-800">Nueva categoría</h3>

            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Nombre de la categoría *</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="ej: Retazos, Accesorios..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Ícono</label>
                <div className="flex flex-wrap gap-2">
                  {ICONOS.map(i => (
                    <button key={i} type="button" onClick={() => setIcono(i)}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border transition-all ${icono === i ? "border-sky-500 bg-sky-50" : "border-slate-200 hover:border-slate-300"}`}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORES_PRESET.map(c => (
                    <button key={c} type="button" onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? "border-slate-800 scale-110" : "border-transparent"}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Campos dinámicos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-500">Campos del ítem</label>
                <button type="button" onClick={addCampo} className="text-xs text-sky-600 flex items-center gap-1 hover:underline">
                  <Plus size={12} /> Agregar campo
                </button>
              </div>
              <div className="space-y-2">
                {campos.map((campo, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-xl p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input value={campo.label} onChange={e => updateCampo(idx, "label", e.target.value)}
                        placeholder="Nombre del campo"
                        className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                      <select value={campo.tipo} onChange={e => updateCampo(idx, "tipo", e.target.value)}
                        className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500">
                        {TIPOS_CAMPO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    {campo.tipo === "select" && (
                      <input
                        placeholder="Opciones separadas por coma: rojo, azul, verde"
                        value={campo.opciones?.join(", ") ?? ""}
                        onChange={e => updateCampo(idx, "opciones", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    )}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                        <input type="checkbox" checked={campo.requerido} onChange={e => updateCampo(idx, "requerido", e.target.checked)}
                          className="rounded" />
                        Campo requerido
                      </label>
                      {idx > 0 && (
                        <button type="button" onClick={() => removeCampo(idx)} className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1">
                          <Trash2 size={12} /> Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

            <button type="submit" disabled={saving}
              className="w-full py-2.5 rounded-xl bg-sky-600 text-white font-semibold text-sm hover:bg-sky-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {saving ? <><Loader2 size={15} className="animate-spin" /> Guardando...</> : "Crear categoría"}
            </button>
          </form>
        )}

        {/* Lista de categorías */}
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-slate-100" />)}</div>
        ) : categorias.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Tag size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Sin categorías aún</p>
            <p className="text-sm mt-1">Crea la primera para comenzar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categorias.map(cat => (
              <CategoriaCard key={cat.id} categoria={cat} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function CategoriaCard({ categoria }: { categoria: Categoria }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50 transition-colors">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: categoria.color + "20" }}>
          {categoria.icono}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-800">{categoria.nombre}</p>
          <p className="text-xs text-slate-400">{categoria.campos.length} campos · Creada {new Date(categoria.fecha_creacion).toLocaleDateString("es-CL")}</p>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {open && (
        <div className="border-t border-slate-100 px-4 py-3">
          <p className="text-xs font-medium text-slate-500 mb-2">Campos configurados:</p>
          <div className="flex flex-wrap gap-2">
            {categoria.campos.map(c => (
              <span key={c.nombre} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full">
                {c.label} {c.requerido && <span className="text-red-400">*</span>}
                <span className="text-slate-400 ml-1">· {c.tipo}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
