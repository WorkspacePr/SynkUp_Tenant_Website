import { NextRequest } from "next/server";
import { proxyUsersRequest } from "../../_proxy";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: NextRequest, context: Context) {
  const { id } = await context.params;
  return proxyUsersRequest(request, `/api/users/${encodeURIComponent(id)}/invitation-status/`, "GET");
}
