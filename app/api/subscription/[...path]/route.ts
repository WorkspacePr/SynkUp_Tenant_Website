import { NextRequest } from "next/server";
import { proxySubscriptionRequest } from "../_proxy";
type Context = { params: Promise<{ path: string[] }> };
export async function GET(request: NextRequest, { params }: Context) { return proxySubscriptionRequest(request, `/api/subscription/${(await params).path.join("/")}/`, "GET"); }
export async function POST(request: NextRequest, { params }: Context) { return proxySubscriptionRequest(request, `/api/subscription/${(await params).path.join("/")}/`, "POST"); }
