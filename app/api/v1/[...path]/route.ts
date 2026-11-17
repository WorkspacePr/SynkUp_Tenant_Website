import { NextRequest, NextResponse } from "next/server";

function getDjangoApiBase() {
  return process.env.DJANGO_API_BASE ?? process.env.NEXT_PUBLIC_DJANGO_API_BASE;
}

function getUpstreamUrl(request: NextRequest) {
  const apiBase = getDjangoApiBase();
  if (!apiBase) throw new Error("DJANGO_API_BASE is not configured.");
  const pathname = request.nextUrl.pathname.endsWith("/")
    ? request.nextUrl.pathname
    : `${request.nextUrl.pathname}/`;
  return new URL(`${pathname}${request.nextUrl.search}`, apiBase);
}

function getForwardHeaders(request: NextRequest, hasBody = false) {
  const headers = new Headers({ Accept: request.headers.get("accept") ?? "application/json" });
  const authorization = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");
  if (authorization) headers.set("Authorization", authorization);
  if (cookie) headers.set("Cookie", cookie);
  if (hasBody && request.headers.get("content-type")) {
    headers.set("Content-Type", request.headers.get("content-type")!);
  }
  return headers;
}

async function proxy(request: NextRequest) {
  try {
    const method = request.method.toUpperCase();
    const hasBody = method !== "GET" && method !== "HEAD";
    const upstream = await fetch(getUpstreamUrl(request), {
      method,
      headers: getForwardHeaders(request, hasBody),
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      redirect: "follow",
    });
    const contentType = upstream.headers.get("content-type") ?? "";
    const rawBody = await upstream.text();
    const headers = new Headers();
    for (const name of ["content-type", "content-disposition", "cache-control", "etag"]) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    if (!upstream.ok && !rawBody.trim()) {
      return NextResponse.json(
        { message: `The dashboard API returned HTTP ${upstream.status}.` },
        { status: upstream.status },
      );
    }

    if (!upstream.ok && !contentType.includes("application/json")) {
      return NextResponse.json(
        { message: `The dashboard API returned HTTP ${upstream.status}.` },
        { status: upstream.status },
      );
    }

    return new NextResponse(rawBody, { status: upstream.status, headers });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error && error.message ? error.message : "Unable to reach the attendance API." },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
