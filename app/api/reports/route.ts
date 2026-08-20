import { NextRequest, NextResponse } from "next/server";

function getApiBase() {
  return process.env.DJANGO_API_BASE ?? process.env.NEXT_PUBLIC_DJANGO_API_BASE;
}

async function proxyReportsRequest(request: NextRequest, method: "GET" | "POST") {
  try {
    const apiBase = getApiBase();
    if (!apiBase) throw new Error("DJANGO_API_BASE is not configured.");

    const url = new URL("/api/reports/", apiBase);
    request.nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value));
    const headers = new Headers({ Accept: "application/json" });
    const authorization = request.headers.get("authorization");
    const cookie = request.headers.get("cookie");
    if (authorization) headers.set("Authorization", authorization);
    if (cookie) headers.set("Cookie", cookie);
    if (method === "POST") headers.set("Content-Type", "application/json");

    const response = await fetch(url, {
      method,
      headers,
      body: method === "POST" ? JSON.stringify(await request.json()) : undefined,
      cache: "no-store",
    });
    const raw = await response.text();
    let payload: unknown;
    try { payload = JSON.parse(raw); } catch { payload = { message: raw || `Upstream service returned HTTP ${response.status}.` }; }
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to process report request." }, { status: 502 });
  }
}

export function GET(request: NextRequest) { return proxyReportsRequest(request, "GET"); }
export function POST(request: NextRequest) { return proxyReportsRequest(request, "POST"); }
