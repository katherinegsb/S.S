import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("fecha_creacion", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { nombre, icono, color, campos } = body;
  if (!nombre || !campos) return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });

  const { data, error } = await supabase
    .from("categorias")
    .insert([{ nombre, icono: icono ?? "📦", color: color ?? "#0ea5e9", campos }])
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
