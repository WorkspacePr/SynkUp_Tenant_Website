import { NextRequest, NextResponse } from "next/server";

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

function buildForwardHeaders(request: NextRequest, includeJsonBody = false) {
  const headers = new Headers({
    Accept: "application/json",
  });

  if (includeJsonBody) {
    headers.set("Content-Type", "application/json");
  }

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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ organizationId: string }> },
) {
  try {
    const { organizationId } = await context.params;

    const response = await fetch(
      buildUpstreamUrl(`/api/organizations/${organizationId}/onboarding/units/`),
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
            : "Unable to load units right now.",
      },
      { status: 502 },
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ organizationId: string }> },
) {
  try {
    const { organizationId } = await context.params;
    const body = await request.json();

    const response = await fetch(
      buildUpstreamUrl(`/api/organizations/${organizationId}/onboarding/units/`),
      {
        method: "POST",
        headers: buildForwardHeaders(request, true),
        body: JSON.stringify(body),
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
            : "Unable to create unit right now.",
      },
      { status: 502 },
    );
  }
}
