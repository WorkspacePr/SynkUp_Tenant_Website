import { NextRequest } from "next/server";
import { proxySettingsRequest } from "../_proxy";
export function PATCH(request: NextRequest) { return proxySettingsRequest(request, "/api/settings/organization/", "PATCH"); }
