import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getDjangoApiBase() {
  return process.env.DJANGO_API_BASE ?? process.env.NEXT_PUBLIC_DJANGO_API_BASE;
}

function buildUpstreamUrl(path: string) {
  const apiBase = getDjangoApiBase();

  if (!apiBase) {
    throw new Error("DJANGO_API_BASE is not configured.");
  }

  return new URL(path, apiBase).toString();
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

function copyUpstreamCookies(upstreamResponse: Response, downstreamResponse: NextResponse) {
  const headers = upstreamResponse.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const setCookieHeaders = headers.getSetCookie?.() ?? [];
  const fallbackSetCookie = upstreamResponse.headers.get("set-cookie");

  for (const setCookie of setCookieHeaders.length > 0
    ? setCookieHeaders
    : fallbackSetCookie
      ? [fallbackSetCookie]
      : []) {
    downstreamResponse.headers.append("set-cookie", setCookie);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookie = request.headers.get("cookie");

    const response = await fetch(
      buildUpstreamUrl("/api/auth/tenant/login/verify-otp/"),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(cookie ? { Cookie: cookie } : {}),
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

    const payload = await readUpstreamPayload(response);
    const nextResponse = NextResponse.json(payload, { status: response.status });
    copyUpstreamCookies(response, nextResponse);

    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error && error.message
            ? error.message
            : "Unable to verify the code right now.",
      },
      { status: 502 },
    );
  }
}
