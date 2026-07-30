import { NextRequest } from "next/server";
import { proxyUsersRequest } from "../_proxy";
export function GET(request: NextRequest) {
  return proxyUsersRequest(request, "/api/users/overview/", "GET");
}
