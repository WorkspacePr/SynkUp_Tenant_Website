import { NextResponse } from "next/server";

function getDjangoApiBase() {
  return process.env.DJANGO_API_BASE ?? process.env.NEXT_PUBLIC_DJANGO_API_BASE;
}

function getReferenceDataPath() {
  return (
    process.env.REFERENCE_DATA_PATH ??
    process.env.NEXT_PUBLIC_REFERENCE_DATA_PATH ??
    "/api/reference-data/"
  );
}

function buildUpstreamUrl(path: string) {
  const apiBase = getDjangoApiBase();

  if (!apiBase) {
    throw new Error("DJANGO_API_BASE is not configured.");
  }

  return new URL(path, apiBase).toString();
}

export async function GET() {
  try {
    const response = await fetch(buildUpstreamUrl(getReferenceDataPath()), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const payload = await response.json();

    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to load reference data right now." },
      { status: 502 },
    );
  }
}
