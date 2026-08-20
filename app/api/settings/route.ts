import { NextRequest } from "next/server";
import { proxySettingsRequest } from "./_proxy";
export function GET(request: NextRequest) { return proxySettingsRequest(request, "/api/settings/", "GET"); }
