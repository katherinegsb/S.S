"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, AlertCircle, Loader2, Home, LogOut } from "lucide-react";
import Link from "next/link";
import { Item } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

type ScanState = "loading" | "success" | "already_used" | "not_found" | "error";

export default function ScanPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();
  const id = searchParams.get("id");

  const [state, setState] = useState<ScanState>("loading");
  const [item, setItem] = useState<Item | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const redirectTo = `/scan${id ? `?id=${id}` : ""}`;
      router.replace(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
      return;
    }
    if (!id) { setState("not_found"); return; }

    async function markAsUsed() {
      const res = await fetch(`/api/items/${id}`, { method: "PATCH" });
      const json = await res.json();
      if (res.status === 401) { router.replace(`/login?redirectTo=${encodeURIComponent(`/scan?id=${id}`)}`); return; }
      if (res.status === 404) setState("not_found");
      else if (res.status === 409 && json.alreadyUsed) setState("already_used");
      else if (!res.ok) setState("error");
      else { setItem(json); setState("success"); }
    }
    markAsUsed();
  }, [id, user, authLoading, router]);

  async function handleSignOut() { await signOut(); router.push("/login"); }

  if (authLoading || (state === "loading" && user)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <Loader2 size={48} className="text-sky-500 animate-spin" />
        <p className="text-slate-500 font-medium">Procesando...</p>
      </div>
    );
  }

  const cat = item?.categoria;
  const attrs = item?.atributos ?? {};

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
      {user && (
        <button onClick={handleSignOut} className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600">
          <LogOut size={14} /> Salir
        </button>
      )}

      {state === "success" && item && (
        <div className="space-y-6 max-w-sm w-full">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-4xl mb-2">{cat?.icono ?? "📦"}</p>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">¡Ítem usado!</h1>
            <p className="text-slate-500 text-sm">Marcado correctamente como usado</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-left space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs text-slate-400">Categoría</span>
              <span className="text-sm font-medium text-slate-700">{cat?.nombre}</span>
            </div>
            {Object.entries(attrs).map(([k, v]) => {
              const campo = cat?.campos?.find(c => c.nombre === k);
              return (
                <div key={k} className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">{campo?.label ?? k}</span>
                  <span className="text-sm font-medium text-slate-700 capitalize">{v}</span>
                </div>
              );
            })}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-400">Fecha de uso</span>
              <span className="text-sm font-medium text-slate-700">{new Date(item.fecha_uso!).toLocaleString("es-CL")}</span>
            </div>
          </div>
          <Link href="/" className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-sky-600 text-white font-semibold hover:bg-sky-700 transition-colors">
            <Home size={18} /> Ir al inventario
          </Link>
        </div>
      )}

      {state === "already_used" && (
        <div className="space-y-6 max-w-sm w-full">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
            <AlertCircle size={40} className="text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Ya fue usado</h1>
            <p className="text-slate-500 text-sm">Este ítem ya estaba marcado como usado</p>
          </div>
          <Link href="/" className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-sky-600 text-white font-semibold hover:bg-sky-700 transition-colors">
            <Home size={18} /> Ir al inventario
          </Link>
        </div>
      )}

      {(state === "not_found" || state === "error") && (
        <div className="space-y-6 max-w-sm w-full">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <XCircle size={40} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {state === "not_found" ? "Ítem no encontrado" : "Error del servidor"}
          </h1>
          <Link href="/" className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-sky-600 text-white font-semibold hover:bg-sky-700 transition-colors">
            <Home size={18} /> Ir al inventario
          </Link>
        </div>
      )}
    </div>
  );
}
