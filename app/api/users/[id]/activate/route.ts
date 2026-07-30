import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const apiBase =
      process.env.DJANGO_API_BASE ?? process.env.NEXT_PUBLIC_DJANGO_API_BASE;
    if (!apiBase) throw new Error("DJANGO_API_BASE is not configured.");
    const { id } = await context.params;
    const headers = new Headers({
      Accept: "application/json",
      "Content-Type": "application/json",
    });
    const authorization = request.headers.get("authorization");
    const cookie = request.headers.get("cookie");
    if (authorization) headers.set("Authorization", authorization);
    if (cookie) headers.set("Cookie", cookie);

    const response = await fetch(
      new URL(`/api/users/${encodeURIComponent(id)}/activate/`, apiBase),
      {
        method: "POST",
        headers,
        body: JSON.stringify(await request.json()),
        cache: "no-store",
      },
    );
    const text = await response.text();
    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text || `Upstream service returned HTTP ${response.status}.` };
    }
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to activate user." },
      { status: 502 },
    );
  }
}
