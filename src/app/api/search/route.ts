import { NextResponse } from "next/server";
import { getAllPerfumes } from "@/lib/data";
import { buildSuggestions } from "@/lib/search";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  if (q.length > 80) return NextResponse.json({ suggestions: [] });
  const suggestions = buildSuggestions(q, await getAllPerfumes());
  return NextResponse.json({ suggestions });
}
