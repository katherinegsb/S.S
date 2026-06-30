import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = params;

  const { data: item, error: fetchError } = await supabase
    .from("items")
    .select("id, estado")
    .eq("id", id)
    .single();

  if (fetchError || !item) return NextResponse.json({ error: "Ítem no encontrado" }, { status: 404 });
  if (item.estado === "usado") {
    return NextResponse.json({ error: "Este ítem ya fue marcado como usado", alreadyUsed: true }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("items")
    .update({ estado: "usado", fecha_uso: new Date().toISOString() })
    .eq("id", id)
    .select("*, categoria:categorias(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("items")
    .select("*, categoria:categorias(*)")
    .eq("id", params.id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Ítem no encontrado" }, { status: 404 });
  return NextResponse.json(data);
}
