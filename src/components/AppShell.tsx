"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, Tag, LogOut, User,
  Menu, X, QrCode, ChevronRight
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/inventario", icon: Package, label: "Inventario" },
  { href: "/categorias", icon: Tag, label: "Categorías" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ── SIDEBAR DESKTOP ─────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-56 bg-slate-900 fixed inset-y-0 left-0 z-30">
        {/* Brand */}
        <div className="px-5 py-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center flex-shrink-0">
              <Package size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">Inventario Pro</p>
              <p className="text-xs text-slate-400">Gestión de stock</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-xs font-medium text-slate-500 px-3 pb-2 uppercase tracking-wider">Principal</p>
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  active
                    ? "bg-sky-500/15 text-sky-400 border-l-2 border-sky-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-800 border-l-2 border-transparent"
                }`}
              >
                <Icon size={17} />
                {label}
                {active && <ChevronRight size={13} className="ml-auto opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-slate-700/50">
          {user && (
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-300 truncate">{user.email}</p>
              </div>
              <button onClick={handleSignOut} title="Cerrar sesión" className="text-slate-500 hover:text-red-400 transition-colors">
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── MOBILE SIDEBAR OVERLAY ──────────────────────────────── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-slate-900 h-full z-50">
            <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
                  <Package size={16} className="text-white" />
                </div>
                <p className="text-sm font-semibold text-white">Inventario Pro</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {NAV.map(({ href, icon: Icon, label }) => {
                const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all border-l-2 ${
                      active ? "bg-sky-500/15 text-sky-400 border-sky-400" : "text-slate-400 hover:text-white hover:bg-slate-800 border-transparent"
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-4 py-4 border-t border-slate-700/50">
              {user && (
                <button onClick={handleSignOut} className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors text-sm w-full px-2 py-2">
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ── MAIN CONTENT ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:ml-56 min-h-screen">

        {/* Mobile topbar */}
        <header className="lg:hidden bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600 p-1">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center">
              <Package size={14} className="text-white" />
            </div>
            <span className="font-semibold text-slate-800 text-sm">Inventario Pro</span>
          </div>
          {user ? (
            <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-xs font-semibold text-white">
              {initials}
            </div>
          ) : <div className="w-7" />}
        </header>

        {/* Desktop topbar */}
        <header className="hidden lg:flex bg-white border-b border-slate-100 px-6 py-3.5 items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-base font-semibold text-slate-800">
              {NAV.find(n => n.href === "/" ? pathname === "/" : pathname.startsWith(n.href))?.label ?? "Inventario Pro"}
            </h1>
            <p className="text-xs text-slate-400">
              {new Date().toLocaleDateString("es-CL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          {user && (
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <User size={14} />
              <span className="max-w-xs truncate">{user.email}</span>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 pb-24 lg:pb-8">
          {children}
        </main>

        {/* ── BOTTOM NAV MOBILE ───────────────────────────────── */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 z-20 pb-safe">
          <div className="flex">
            {NAV.map(({ href, icon: Icon, label }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                    active ? "text-sky-500" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
