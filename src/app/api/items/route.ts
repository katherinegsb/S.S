import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(req.url);
  const categoriaId = searchParams.get("categoria_id");

  let query = supabase
    .from("items")
    .select("*, categoria:categorias(*)")
    .order("fecha_creacion", { ascending: false });

  if (categoriaId) query = query.eq("categoria_id", categoriaId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { categoria_id, atributos } = body;
  if (!categoria_id || !atributos) return NextResponse.json({ error: "Faltan campos" }, { status: 400 });

  const { data, error } = await supabase
    .from("items")
    .insert([{ categoria_id, atributos }])
    .select("*, categoria:categorias(*)")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
