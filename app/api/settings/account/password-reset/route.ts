import { NextRequest } from "next/server";
import { proxySettingsRequest } from "../../_proxy";
export function POST(request: NextRequest) { return proxySettingsRequest(request, "/api/settings/account/password-reset/", "POST"); }
