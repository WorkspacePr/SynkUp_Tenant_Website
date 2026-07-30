import { NextRequest, NextResponse } from "next/server";

function getApiBase() {
  return process.env.DJANGO_API_BASE ?? process.env.NEXT_PUBLIC_DJANGO_API_BASE;
}

export async function proxyUsersRequest(
  request: NextRequest,
  path: string,
  method: "GET" | "POST",
  bodyKind: "none" | "json" | "form" = "none",
) {
  try {
    const apiBase = getApiBase();
    if (!apiBase) throw new Error("DJANGO_API_BASE is not configured.");
    const url = new URL(path, apiBase);
    request.nextUrl.searchParams.forEach((value, key) => url.searchParams.append(key, value));

    const headers = new Headers({ Accept: "application/json" });
    const authorization = request.headers.get("authorization");
    const cookie = request.headers.get("cookie");
    if (authorization) headers.set("Authorization", authorization);
    if (cookie) headers.set("Cookie", cookie);
    if (bodyKind === "json") headers.set("Content-Type", "application/json");

    const response = await fetch(url, {
      method,
      headers,
      body:
        bodyKind === "json"
          ? JSON.stringify(await request.json())
          : bodyKind === "form"
            ? await request.formData()
            : undefined,
      cache: "no-store",
    });
    const text = await response.text();
    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text || `Upstream service returned HTTP ${response.status}.` };
    }
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to process user request." },
      { status: 502 },
    );
  }
}
