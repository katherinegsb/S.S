"use client";

import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { Categoria } from "@/lib/supabase";

interface CreateItemFormProps {
  categorias: Categoria[];
  onCreated: () => void;
  onClose: () => void;
  defaultCategoriaId?: string;
}

export function CreateItemForm({ categorias, onCreated, onClose, defaultCategoriaId }: CreateItemFormProps) {
  const [categoriaId, setCategoriaId] = useState(defaultCategoriaId ?? categorias[0]?.id ?? "");
  const [atributos, setAtributos] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categoria = categorias.find(c => c.id === categoriaId);

  function handleCategoriaChange(id: string) {
    setCategoriaId(id);
    setAtributos({});
  }

  function handleAttr(nombre: string, valor: string) {
    setAtributos(prev => ({ ...prev, [nombre]: valor }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validar campos requeridos
    const faltantes = categoria?.campos.filter(c => c.requerido && !atributos[c.nombre]);
    if (faltantes?.length) {
      setError(`Completa: ${faltantes.map(c => c.label).join(", ")}`);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoria_id: categoriaId, atributos }),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Error al crear");
      setLoading(false);
      return;
    }

    onCreated();
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <span>{categoria?.icono ?? "📦"}</span>
          Nuevo ítem
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Selector de categoría */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Categoría</label>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
            {categorias.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoriaChange(cat.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  categoriaId === cat.id
                    ? "border-sky-500 bg-sky-50 text-sky-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <span>{cat.icono}</span>
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Campos dinámicos según categoría */}
        {categoria?.campos.map(campo => (
          <div key={campo.nombre}>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              {campo.label}
              {campo.requerido && <span className="text-red-400 ml-0.5">*</span>}
            </label>
            {campo.tipo === "select" ? (
              <select
                value={atributos[campo.nombre] ?? ""}
                onChange={e => handleAttr(campo.nombre, e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Selecciona...</option>
                {campo.opciones?.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            ) : (
              <input
                type={campo.tipo === "number" ? "number" : "text"}
                value={atributos[campo.nombre] ?? ""}
                onChange={e => handleAttr(campo.nombre, e.target.value)}
                placeholder={`Ingresa ${campo.label.toLowerCase()}`}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            )}
          </div>
        ))}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !categoria}
          className="w-full py-2.5 rounded-xl bg-sky-600 text-white font-semibold text-sm hover:bg-sky-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={15} className="animate-spin" /> Guardando...</> : <><Plus size={15} /> Crear ítem</>}
        </button>
      </form>
    </div>
  );
}
