"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Package, Plus, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/AppShell";
import { ItemCard } from "@/components/ItemCard";
import { CreateItemForm } from "@/components/CreateItemForm";
import { Item, Categoria } from "@/lib/supabase";

type Tab = "disponible" | "usado";

function InventarioContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cat");

  const [items, setItems] = useState<Item[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("disponible");
  const [showForm, setShowForm] = useState(false);
  const [catFiltro, setCatFiltro] = useState<string>(catParam ?? "");
  const [busqueda, setBusqueda] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [itemsRes, catRes] = await Promise.all([fetch("/api/items"), fetch("/api/categorias")]);
    if (itemsRes.ok) setItems(await itemsRes.json());
    if (catRes.ok) setCategorias(await catRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtrados = items.filter(item => {
    if (item.estado !== tab) return false;
    if (catFiltro && item.categoria_id !== catFiltro) return false;
    if (busqueda) {
      const texto = Object.values(item.atributos ?? {}).join(" ").toLowerCase();
      if (!texto.includes(busqueda.toLowerCase())) return false;
    }
    return true;
  });

  const disponibles = items.filter(i => i.estado === "disponible");
  const usados = items.filter(i => i.estado === "usado");

  return (
    <AppShell>
      <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="lg:hidden text-lg font-bold text-slate-800">Inventario</h2>
            <p className="text-sm text-slate-400">{items.length} ítems en total</p>
          </div>
          {user && (
            <button
              onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 text-white font-semibold text-sm hover:bg-sky-700 active:scale-95 transition-all shadow-sm"
            >
              <Plus size={16} />
              {showForm ? "Cancelar" : "Nuevo ítem"}
            </button>
          )}
        </div>

        {/* Formulario */}
        {showForm && user && (
          <CreateItemForm
            categorias={categorias}
            defaultCategoriaId={catFiltro || undefined}
            onCreated={() => { fetchData(); setShowForm(false); }}
            onClose={() => setShowForm(false)}
          />
        )}

        {/* Filtros */}
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por color, tipo..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          {/* Filtro categoría */}
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => setCatFiltro("")}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all ${!catFiltro ? "bg-sky-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"}`}
            >
              Todos
            </button>
            {categorias.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCatFiltro(cat.id === catFiltro ? "" : cat.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${catFiltro === cat.id ? "bg-sky-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"}`}
              >
                {cat.icono} {cat.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 rounded-xl p-1">
          {(["disponible", "usado"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {t === "disponible" ? `Disponibles (${disponibles.length})` : `Usados (${usados.length})`}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-white rounded-2xl animate-pulse border border-slate-100" />)}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No hay ítems {tab === "disponible" ? "disponibles" : "usados"}</p>
            {user && tab === "disponible" && (
              <button onClick={() => setShowForm(true)} className="text-sm text-sky-500 mt-2 hover:underline">
                Agregar el primero
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtrados.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function InventarioPage() {
  return <Suspense fallback={<AppShell><div className="p-6 text-slate-400">Cargando...</div></AppShell>}><InventarioContent /></Suspense>;
}
