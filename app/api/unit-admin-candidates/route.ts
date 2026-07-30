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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function GET(request: NextRequest) {
  try {
    const organizationId = request.nextUrl.searchParams.get("organizationId");

    if (!organizationId?.trim()) {
      return NextResponse.json(
        { message: "organizationId is required." },
        { status: 400 },
      );
    }

    const headers = buildForwardHeaders(request);

    const [reviewResponse, invitesResponse] = await Promise.all([
      fetch(
        buildUpstreamUrl(`/api/organizations/${organizationId}/onboarding/review/`),
        {
          method: "GET",
          headers,
          cache: "no-store",
        },
      ),
      fetch(
        buildUpstreamUrl(`/api/organizations/${organizationId}/onboarding/admin-invites/`),
        {
          method: "GET",
          headers,
          cache: "no-store",
        },
      ),
    ]);

    const [reviewPayload, invitesPayload] = await Promise.all([
      readUpstreamPayload(reviewResponse),
      readUpstreamPayload(invitesResponse),
    ]);

    if (!reviewResponse.ok) {
      return NextResponse.json(reviewPayload, { status: reviewResponse.status });
    }

    if (!invitesResponse.ok) {
      return NextResponse.json(invitesPayload, { status: invitesResponse.status });
    }

    const reviewRecord = isRecord(reviewPayload) ? reviewPayload : {};
    const primaryAdmin = isRecord(reviewRecord.primary_admin)
      ? reviewRecord.primary_admin
      : null;
    const invitesRecord = isRecord(invitesPayload) ? invitesPayload : {};
    const acceptedInviteCount = Number(invitesRecord.accepted_count ?? 0);

    const candidates: Array<{
      id: number;
      name: string;
      email: string;
      source: "primary_admin";
      is_primary_admin: boolean;
    }> = [];

    if (
      primaryAdmin &&
      typeof primaryAdmin.user_id === "number" &&
      typeof primaryAdmin.email === "string"
    ) {
      const fullName = `${typeof primaryAdmin.first_name === "string" ? primaryAdmin.first_name : ""} ${typeof primaryAdmin.last_name === "string" ? primaryAdmin.last_name : ""}`.trim();

      candidates.push({
        id: primaryAdmin.user_id,
        name: fullName || primaryAdmin.email,
        email: primaryAdmin.email,
        source: "primary_admin",
        is_primary_admin: true,
      });
    }

    return NextResponse.json({
      results: candidates,
      meta: {
        organization_id: Number(organizationId),
        note:
          acceptedInviteCount > 0
            ? "Primary admin is directly assignable. Accepted invitees are not included yet because the current upstream admin-invites payload does not expose assignable user ids."
            : candidates.length === 0
              ? "No assignable unit admins are currently available from upstream onboarding data."
              : null,
        accepted_invite_count: acceptedInviteCount,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error && error.message
            ? error.message
            : "Unable to load unit admin candidates right now.",
      },
      { status: 502 },
    );
  }
}
