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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ organizationId: string }> },
) {
  try {
    const { organizationId } = await context.params;

    const response = await fetch(
      buildUpstreamUrl(`/api/organizations/${organizationId}/onboarding/`),
      {
        method: "GET",
        headers: buildForwardHeaders(request),
        cache: "no-store",
      },
    );

    const payload = await response.json();

    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to load onboarding status right now." },
      { status: 502 },
    );
  }
}
