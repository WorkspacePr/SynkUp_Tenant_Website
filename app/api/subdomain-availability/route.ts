import { NextRequest, NextResponse } from "next/server";

function getDjangoApiBase() {
  return process.env.DJANGO_API_BASE ?? process.env.NEXT_PUBLIC_DJANGO_API_BASE;
}

function getSubdomainAvailabilityPath() {
  return (
    process.env.SUBDOMAIN_AVAILABILITY_PATH ??
    process.env.NEXT_PUBLIC_SUBDOMAIN_AVAILABILITY_PATH ??
    "/api/subdomain-availability/"
  );
}

function buildUpstreamUrl(path: string, subdomain: string) {
  const apiBase = getDjangoApiBase();

  if (!apiBase) {
    throw new Error("DJANGO_API_BASE is not configured.");
  }

  const url = new URL(path, apiBase);
  url.searchParams.set("subdomain", subdomain);
  return url.toString();
}

export async function GET(request: NextRequest) {
  const subdomain = request.nextUrl.searchParams.get("subdomain")?.trim().toLowerCase() ?? "";

  if (!subdomain) {
    return NextResponse.json(
      {
        subdomain,
        available: false,
        message: "Subdomain is required.",
        suggestions: [],
      },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      buildUpstreamUrl(getSubdomainAvailabilityPath(), subdomain),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    const payload = await response.json();

    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      {
        subdomain,
        available: false,
        message: "Unable to verify subdomain availability right now.",
        suggestions: [],
      },
      { status: 502 },
    );
  }
}
