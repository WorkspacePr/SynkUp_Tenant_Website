import { formatApiError } from "@/lib/api/errors";
import { apiEndpoints } from "@/lib/api/endpoints";
import { getValidOnboardingAccessToken } from "@/lib/auth/tenant-session";

export type SubscriptionOverview = { plan: string; status: "active" | "past_due" | "expired" | "cancelled" | "trial"; billing_cycle: "monthly" | "annual"; renewal_or_expiry_date: string; amount: string; currency: string; usage: { users: { used: number; limit: number | null }; units: { used: number; limit: number | null } }; feature_tier: string; entitlements: Record<string, boolean> | null; read_only: boolean; enforcement_state: string; pending_change: { plan: string | null; billing_cycle: "monthly" | "annual" | null; effective_at: string } | null };
export type SubscriptionPlan = { id: string; name: string; feature_tier: string; prices: { monthly: string; annual: string; currency: string }; limits: { users: number | null; units: number | null }; entitlements: Record<string, boolean> | null };
export type SubscriptionInvoice = { id: string; invoice_id?: string; issued_at?: string; created_at?: string; amount: string; currency?: string; status: "paid" | "open" | "failed" | "void"; download_url?: string | null };
export type PaymentMethod = { provider: string; brand: string; last4: string; expiry_month: number; expiry_year: number; is_default: boolean; updated_at: string };

async function headers(json = false) { const result = new Headers({ Accept: "application/json" }); const token = await getValidOnboardingAccessToken(); if (token) result.set("Authorization", `Bearer ${token}`); if (json) result.set("Content-Type", "application/json"); return result; }
async function body(response: Response) { return response.json().catch(() => ({})) as Promise<unknown>; }
async function request<T>(url: string, init?: RequestInit) { try { const response = await fetch(url, { ...init, cache: "no-store" }); const payload = await body(response); return response.ok ? { success: true as const, data: payload as T } : { success: false as const, message: formatApiError(payload, "Unable to complete this subscription request.") }; } catch { return { success: false as const, message: "Unable to reach the subscription service." }; } }

export async function getTenantSubscription() { return request<SubscriptionOverview>(apiEndpoints.tenantSubscription, { headers: await headers() }); }
export async function getSubscriptionPlans() { return request<{ results: SubscriptionPlan[] }>(apiEndpoints.tenantSubscriptionPlans, { headers: await headers() }); }
export async function getSubscriptionInvoices(page = 1) { return request<{ count: number; next: string | null; previous: string | null; results: SubscriptionInvoice[] }>(`${apiEndpoints.tenantSubscriptionInvoices}?page=${page}&page_size=10`, { headers: await headers() }); }
export async function getPaymentMethod() { return request<{ payment_method: PaymentMethod | null }>(apiEndpoints.tenantSubscriptionPaymentMethod, { headers: await headers() }); }
export async function requestBillingCycleChange(billing_cycle: "monthly" | "annual") { return request<SubscriptionOverview>(apiEndpoints.tenantSubscriptionBillingCycle, { method: "POST", headers: await headers(true), body: JSON.stringify({ billing_cycle }) }); }
export async function requestPlanChange(plan: string) { return request<SubscriptionOverview>(apiEndpoints.tenantSubscriptionPlanChange, { method: "POST", headers: await headers(true), body: JSON.stringify({ plan }) }); }
export async function createPaymentMethodSetup(return_url: string) { return request<{ provider: string; setup_id: string; setup_url: string }>(apiEndpoints.tenantSubscriptionPaymentMethodSetup, { method: "POST", headers: await headers(true), body: JSON.stringify({ return_url }) }); }
export function invoiceId(invoice: SubscriptionInvoice) { return invoice.invoice_id ?? invoice.id; }
