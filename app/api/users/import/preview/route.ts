import { NextRequest } from "next/server";
import { proxyUsersRequest } from "../../_proxy";
export function POST(request: NextRequest) {
  return proxyUsersRequest(request, "/api/users/import/preview/", "POST", "form");
}
