import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const apiBase = process.env.DJANGO_API_BASE ?? process.env.NEXT_PUBLIC_DJANGO_API_BASE;
    if (!apiBase) throw new Error("DJANGO_API_BASE is not configured.");
    const { id } = await params;
    const url = new URL(`/api/reports/${encodeURIComponent(id)}/`, apiBase);
    const headers = new Headers({ Accept: "application/json" });
    const authorization = request.headers.get("authorization");
    const cookie = request.headers.get("cookie");
    if (authorization) headers.set("Authorization", authorization);
    if (cookie) headers.set("Cookie", cookie);
    const response = await fetch(url, { headers, cache: "no-store" });
    const raw = await response.text();
    let payload: unknown;
    try { payload = JSON.parse(raw); } catch { payload = { message: raw || `Upstream service returned HTTP ${response.status}.` }; }
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to load report." }, { status: 502 });
  }
}
