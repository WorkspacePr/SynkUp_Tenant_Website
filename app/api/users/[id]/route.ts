import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

function getDjangoApiBase() {
  return process.env.DJANGO_API_BASE ?? process.env.NEXT_PUBLIC_DJANGO_API_BASE;
}

async function buildUpstreamUrl(context: RouteContext) {
  const apiBase = getDjangoApiBase();
  if (!apiBase) throw new Error("DJANGO_API_BASE is not configured.");
  const { id } = await context.params;
  return new URL(`/api/users/${encodeURIComponent(id)}/`, apiBase);
}

function buildHeaders(request: NextRequest, includeJsonBody = false) {
  const headers = new Headers({ Accept: "application/json" });
  const authorization = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");
  if (authorization) headers.set("Authorization", authorization);
  if (cookie) headers.set("Cookie", cookie);
  if (includeJsonBody) headers.set("Content-Type", "application/json");
  return headers;
}

async function readPayload(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text || `Upstream service returned HTTP ${response.status}.` };
  }
}

async function forward(
  request: NextRequest,
  context: RouteContext,
  method: "GET" | "PUT" | "PATCH",
) {
  try {
    const hasBody = method !== "GET";
    const response = await fetch(await buildUpstreamUrl(context), {
      method,
      headers: buildHeaders(request, hasBody),
      body: hasBody ? JSON.stringify(await request.json()) : undefined,
      cache: "no-store",
    });
    return NextResponse.json(await readPayload(response), { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to process user request." },
      { status: 502 },
    );
  }
}

export function GET(request: NextRequest, context: RouteContext) {
  return forward(request, context, "GET");
}

export function PUT(request: NextRequest, context: RouteContext) {
  return forward(request, context, "PUT");
}

export function PATCH(request: NextRequest, context: RouteContext) {
  return forward(request, context, "PATCH");
}
