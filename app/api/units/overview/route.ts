import { NextRequest, NextResponse } from "next/server";

function getDjangoApiBase() {
  return process.env.DJANGO_API_BASE ?? process.env.NEXT_PUBLIC_DJANGO_API_BASE;
}

function buildUpstreamUrl(path: string, searchParams: URLSearchParams) {
  const apiBase = getDjangoApiBase();

  if (!apiBase) {
    throw new Error("DJANGO_API_BASE is not configured.");
  }

  const url = new URL(path, apiBase);

  searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
}

function buildForwardHeaders(request: NextRequest) {
  const headers = new Headers({
    Accept: "application/json",
  });

  const authorization = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");

  if (authorization) {
    headers.set("Authorization", authorization);
  }

  if (cookie) {
    headers.set("Cookie", cookie);
  }

  return headers;
}

async function readUpstreamPayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  const rawText = await response.text();

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      return {
        message: rawText || "Invalid JSON response from upstream service.",
      };
    }
  }

  return {
    message: rawText || `Upstream service returned HTTP ${response.status}.`,
  };
}

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(
      buildUpstreamUrl("/api/units/overview/", request.nextUrl.searchParams),
      {
        method: "GET",
        headers: buildForwardHeaders(request),
        cache: "no-store",
      },
    );

    const payload = await readUpstreamPayload(response);
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error && error.message
            ? error.message
            : "Unable to load unit overview right now.",
      },
      { status: 502 },
    );
  }
}
