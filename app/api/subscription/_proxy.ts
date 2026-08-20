import { NextRequest, NextResponse } from "next/server";

export async function proxySubscriptionRequest(request: NextRequest, path: string, method: "GET" | "POST") {
  try {
    const apiBase = process.env.DJANGO_API_BASE ?? process.env.NEXT_PUBLIC_DJANGO_API_BASE;
    if (!apiBase) throw new Error("DJANGO_API_BASE is not configured.");
    const url = new URL(path, apiBase);
    request.nextUrl.searchParams.forEach((value, key) => url.searchParams.append(key, value));
    const headers = new Headers({ Accept: "application/json" });
    const authorization = request.headers.get("authorization");
    const cookie = request.headers.get("cookie");
    if (authorization) headers.set("Authorization", authorization);
    if (cookie) headers.set("Cookie", cookie);
    if (method === "POST") headers.set("Content-Type", "application/json");
    const response = await fetch(url, { method, headers, body: method === "POST" ? JSON.stringify(await request.json()) : undefined, cache: "no-store", redirect: "manual" });
    if (response.status >= 300 && response.status < 400) return NextResponse.redirect(response.headers.get("location") ?? "/", response.status);
    const raw = await response.text();
    let payload: unknown;
    try { payload = JSON.parse(raw); } catch { payload = { message: raw || `Upstream service returned HTTP ${response.status}.` }; }
    return NextResponse.json(payload, { status: response.status });
  } catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to process subscription request." }, { status: 502 }); }
}
