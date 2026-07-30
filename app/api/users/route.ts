import { NextRequest, NextResponse } from "next/server";

function getDjangoApiBase() {
  return process.env.DJANGO_API_BASE ?? process.env.NEXT_PUBLIC_DJANGO_API_BASE;
}

function buildUpstreamUrl(request: NextRequest) {
  const apiBase = getDjangoApiBase();

  if (!apiBase) {
    throw new Error("DJANGO_API_BASE is not configured.");
  }

  const url = new URL("/api/users/", apiBase);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });
  return url;
}

function buildForwardHeaders(request: NextRequest, includeJsonBody = false) {
  const headers = new Headers({ Accept: "application/json" });
  const authorization = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");

  if (authorization) {
    headers.set("Authorization", authorization);
  }
  if (cookie) {
    headers.set("Cookie", cookie);
  }
  if (includeJsonBody) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

async function readUpstreamPayload(response: Response) {
  const rawText = await response.text();

  try {
    return JSON.parse(rawText) as unknown;
  } catch {
    return {
      message: rawText || `Upstream service returned HTTP ${response.status}.`,
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(buildUpstreamUrl(request), {
      method: "GET",
      headers: buildForwardHeaders(request),
      cache: "no-store",
    });
    const payload = await readUpstreamPayload(response);

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error && error.message
            ? error.message
            : "Unable to load users right now.",
      },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(buildUpstreamUrl(request), {
      method: "POST",
      headers: buildForwardHeaders(request, true),
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const payload = await readUpstreamPayload(response);

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error && error.message
            ? error.message
            : "Unable to create user right now.",
      },
      { status: 502 },
    );
  }
}
