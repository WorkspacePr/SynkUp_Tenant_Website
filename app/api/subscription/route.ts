import { NextRequest } from "next/server";
import { proxySubscriptionRequest } from "./_proxy";
export function GET(request: NextRequest) { return proxySubscriptionRequest(request, "/api/subscription/", "GET"); }
