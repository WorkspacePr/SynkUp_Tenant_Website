import { NextRequest, NextResponse } from "next/server";

function getApiBase() {
  return process.env.DJANGO_API_BASE ?? process.env.NEXT_PUBLIC_DJANGO_API_BASE;
}

export async function POST(request: NextRequest) {
  try {
    const apiBase = getApiBase();
    if (!apiBase) throw new Error("DJANGO_API_BASE is not configured.");

    const headers = new Headers({
      Accept: "text/csv, application/json",
      "Content-Type": "application/json",
    });
    const authorization = request.headers.get("authorization");
    const cookie = request.headers.get("cookie");
    if (authorization) headers.set("Authorization", authorization);
    if (cookie) headers.set("Cookie", cookie);

    const response = await fetch(
      new URL("/api/users/bulk/export/", apiBase),
      {
        method: "POST",
        headers,
        body: JSON.stringify(await request.json()),
        cache: "no-store",
      },
    );
    const body = await response.arrayBuffer();
    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/octet-stream",
        "Content-Disposition":
          response.headers.get("content-disposition") ??
          'attachment; filename="selected-users.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to export selected users.",
      },
      { status: 502 },
    );
  }
}
