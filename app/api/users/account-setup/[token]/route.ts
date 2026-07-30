import { NextRequest } from "next/server";
import { proxyUsersRequest } from "../../_proxy";
type Context = { params: Promise<{ token: string }> };
export async function GET(request: NextRequest, context: Context) {
  const { token } = await context.params;
  return proxyUsersRequest(request, `/api/users/account-setup/${encodeURIComponent(token)}/`, "GET");
}
export async function POST(request: NextRequest, context: Context) {
  const { token } = await context.params;
  return proxyUsersRequest(request, `/api/users/account-setup/${encodeURIComponent(token)}/`, "POST", "json");
}
