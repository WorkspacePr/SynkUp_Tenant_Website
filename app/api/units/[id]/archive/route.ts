import { NextRequest, NextResponse } from "next/server";

function getDjangoApiBase() {
  return process.env.DJANGO_API_BASE ?? process.env.NEXT_PUBLIC_DJANGO_API_BASE;
}

function buildUpstreamUrl(path: string) {
  const apiBase = getDjangoApiBase();
  if (!apiBase) throw new Error("DJANGO_API_BASE is not configured.");
  return new URL(path, apiBase).toString();
}

function buildForwardHeaders(request: NextRequest) {
  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
  });
  const authorization = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");
  if (authorization) headers.set("Authorization", authorization);
  if (cookie) headers.set("Cookie", cookie);
  return headers;
}

async function readUpstreamPayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  const rawText = await response.text();
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      return { message: rawText || "Invalid JSON response from upstream service." };
    }
  }
  return { message: rawText || `Upstream service returned HTTP ${response.status}.` };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function extractApiErrorMessage(payload: unknown, fallback: string) {
  if (!isRecord(payload)) {
    return fallback;
  }

  const directMessage =
    typeof payload.message === "string" && payload.message.trim()
      ? payload.message.trim()
      : typeof payload.detail === "string" && payload.detail.trim()
        ? payload.detail.trim()
        : null;

  if (directMessage && directMessage !== "Validation failed.") {
    return directMessage;
  }

  const errors = payload.errors;
  if (Array.isArray(errors)) {
    const firstError = errors.find(
      (value) => typeof value === "string" && value.trim().length > 0,
    );
    if (typeof firstError === "string") {
      return firstError.trim();
    }
  }

  if (isRecord(errors)) {
    for (const [field, value] of Object.entries(errors)) {
      if (Array.isArray(value) && value.length > 0) {
        const first = value[0];
        if (typeof first === "string" && first.trim()) {
          return `${field}: ${first.trim()}`;
        }
      }

      if (typeof value === "string" && value.trim()) {
        return `${field}: ${value.trim()}`;
      }
    }
  }

  for (const [field, value] of Object.entries(payload)) {
    if (field === "message" || field === "detail" || field === "errors") {
      continue;
    }

    if (Array.isArray(value) && value.length > 0) {
      const first = value[0];
      if (typeof first === "string" && first.trim()) {
        return `${field}: ${first.trim()}`;
      }
    }

    if (typeof value === "string" && value.trim()) {
      return `${field}: ${value.trim()}`;
    }
  }

  return directMessage || fallback;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const response = await fetch(buildUpstreamUrl(`/api/units/${id}/archive/`), {
      method: "POST",
      headers: buildForwardHeaders(request),
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const payload = await readUpstreamPayload(response);

    if (!response.ok) {
      console.error("Unit archive request failed", {
        unitId: id,
        status: response.status,
        requestBody: body,
        upstreamPayload: payload,
      });
    }

    if (response.ok) {
      return NextResponse.json(payload, { status: response.status });
    }

    return NextResponse.json(
      {
        ...(isRecord(payload) ? payload : { payload }),
        message: extractApiErrorMessage(payload, "Unable to archive unit right now."),
      },
      { status: response.status },
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error && error.message ? error.message : "Unable to archive unit right now." },
      { status: 502 },
    );
  }
}
