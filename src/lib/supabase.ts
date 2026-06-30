// ─── Types del sistema multi-producto ────────────────────────────────────────

export type ItemEstado = "disponible" | "usado";

export interface CampoSchema {
  nombre: string;       // "color"
  label: string;        // "Color"
  tipo: "text" | "select" | "number";
  opciones?: string[];  // para tipo "select"
  requerido: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
  icono: string;        // nombre de emoji o lucide icon
  color: string;        // color hex para la UI
  campos: CampoSchema[];
  fecha_creacion: string;
}

export interface Item {
  id: string;
  categoria_id: string;
  categoria?: Categoria;
  estado: ItemEstado;
  atributos: Record<string, string>;
  fecha_creacion: string;
  fecha_uso: string | null;
}

// Legacy — mantener para compatibilidad durante migración
export interface Cono {
  id: string;
  tipo: string;
  color: string;
  medida: string;
  estado: "disponible" | "usado";
  fecha_creacion: string;
  fecha_uso: string | null;
}
