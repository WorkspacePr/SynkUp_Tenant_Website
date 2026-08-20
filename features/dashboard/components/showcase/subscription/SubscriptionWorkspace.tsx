"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CreditCard,
  Download,
  Rocket,
  ShieldCheck,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  DashboardToast,
  type DashboardToastTone,
} from "@/components/ui/DashboardToast";
import { Input } from "@/components/ui/Input";
import { cn } from "@/utils";
import {
  createPaymentMethodSetup,
  getPaymentMethod,
  getSubscriptionInvoices,
  getSubscriptionPlans,
  getTenantSubscription,
  invoiceId,
  requestBillingCycleChange,
  requestPlanChange,
  type PaymentMethod,
  type SubscriptionInvoice,
  type SubscriptionOverview,
  type SubscriptionPlan,
} from "@/features/dashboard/api/tenant-subscription";

import { CompactSelect } from "../cards/ShowcaseParts";
import { UnitsPageHeader } from "../units/sections/UnitsPageHeader";

type ToastNotice = {
  tone: DashboardToastTone;
  title: string;
  description: string;
};
type SubscriptionWorkspaceProps = { darkMode: boolean; expired?: boolean };

const naira = "\u20a6";
export function SubscriptionWorkspace({
  darkMode,
  expired = false,
}: SubscriptionWorkspaceProps) {
  const [planPickerMode, setPlanPickerMode] = useState<
    "all" | "upgrade" | null
  >(null);
  const [showPayment, setShowPayment] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"Annual" | "Monthly">(
    "Annual",
  );
  const [toast, setToast] = useState<ToastNotice | null>(null);
  const [overview, setOverview] = useState<SubscriptionOverview | null>(null);
  const [overviewLoaded, setOverviewLoaded] = useState(false);
  const [catalog, setCatalog] = useState<SubscriptionPlan[]>([]);
  const [invoiceResults, setInvoiceResults] = useState<SubscriptionInvoice[]>(
    [],
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const surface = darkMode
    ? "border-slate-800 bg-slate-900"
    : "border-slate-100 bg-white";
  const cardClass = cn(
    "rounded-[22px] border p-5 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.35)]",
    surface,
  );
  const showToast = (
    tone: DashboardToastTone,
    title: string,
    description: string,
  ) => setToast({ tone, title, description });

  useEffect(() => {
    let active = true;
    async function loadSubscription() {
      const [subscription, planCatalog, invoicePage, payment] =
        await Promise.all([
          getTenantSubscription(),
          getSubscriptionPlans(),
          getSubscriptionInvoices(),
          getPaymentMethod(),
        ]);
      if (!active) return;
      if (subscription.success) {
        setOverview(subscription.data);
        setBillingCycle(
          subscription.data.billing_cycle === "annual" ? "Annual" : "Monthly",
        );
      } else
        showToast("error", "Unable to load subscription", subscription.message);
      setOverviewLoaded(true);
      if (planCatalog.success) setCatalog(planCatalog.data.results);
      if (invoicePage.success) setInvoiceResults(invoicePage.data.results);
      if (payment.success) setPaymentMethod(payment.data.payment_method);
    }
    void loadSubscription();
    return () => {
      active = false;
    };
  }, []);

  const activeExpired =
    expired ||
    overview?.status === "expired" ||
    overview?.status === "cancelled";
  const activePlan = overview?.plan ?? "—";
  const planOrder = ["basic", "pro", "enterprise"];
  const activePlanIndex = planOrder.indexOf(activePlan.toLowerCase());
  const visiblePlans = catalog.filter((plan) =>
    planPickerMode === "upgrade" && activePlanIndex >= 0
      ? planOrder.indexOf(plan.name.toLowerCase()) > activePlanIndex
      : true,
  );
  const showAmount = overview?.status !== "trial" && Boolean(overview?.amount);
  const usedInvoices = invoiceResults.length
    ? invoiceResults.map((invoice) => ({
        date: invoice.issued_at ?? invoice.created_at ?? "—",
        amount: `${invoice.currency ?? naira}${invoice.amount}`,
        status: invoice.status,
        id: invoiceId(invoice),
      }))
    : [];

  return (
    <section className="pb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <UnitsPageHeader
          darkMode={darkMode}
          title="Subscription"
          description="Manage your organization's plan and billing"
        />
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-300">
          <ShieldCheck className="h-4 w-4" /> Secure billing workspace
        </div>
      </div>

      {activeExpired ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-200">
          <span className="font-medium">
            Your subscription has expired. The system is in read-only mode.
          </span>
          <button
            type="button"
            className="font-bold underline underline-offset-4"
            onClick={() => setPlanPickerMode("all")}
          >
            Renew now
          </button>
        </div>
      ) : null}

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.13fr_1fr]">
        <Card className={cardClass}>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold capitalize">{activePlan.replaceAll("_"," ")} Plan</h2>
            <StatusPill expired={activeExpired} />
          </div>
          <div className="mt-7">
            {showAmount ? (
              <>
                <span className="text-3xl font-bold tracking-[-0.04em]">
                  {overview?.currency ?? naira}{overview?.amount}
                </span>
                <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                  / {billingCycle.toLowerCase()}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Free trial</span>
            )}
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {!overviewLoaded ? <span className="inline-block h-4 w-52 animate-pulse rounded bg-slate-200 dark:bg-slate-700" aria-label="Loading subscription date" /> : overview?.renewal_or_expiry_date
                ? `${overview?.status === "trial" ? "Trial ends" : activeExpired ? "Expired" : "Renews"} ${new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(overview.renewal_or_expiry_date))}`
                : overview?.status === "trial" ? "Trial end date is not available." : "Renewal date is not available."}
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3 capitalize">
            {[
              {
                label: "Feature tier",
                value: overview?.feature_tier?.replaceAll("_", " ") ?? "—",
                progress: 100,
              },
              {
                label: "Users",
                value: overview
                  ? `${overview.usage.users.used} / ${overview.usage.users.limit ?? "∞"}`
                  : "—",
                progress: overview?.usage.users.limit
                  ? Math.min(
                      100,
                      (overview.usage.users.used / overview.usage.users.limit) *
                        100,
                    )
                  : 0,
              },
              {
                label: "Units",
                value: overview
                  ? `${overview.usage.units.used} / ${overview.usage.units.limit ?? "∞"}`
                  : "—",
                progress: overview?.usage.units.limit
                  ? Math.min(
                      100,
                      (overview.usage.units.used / overview.usage.units.limit) *
                        100,
                    )
                  : 0,
              },
            ].map((item) => (
              <UsageCard key={item.label} darkMode={darkMode} {...item} />
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              className="min-h-11 rounded-xl px-5 py-2.5"
              onClick={() => setPlanPickerMode(activeExpired ? "all" : "upgrade")}
            >
              <Rocket className="h-4 w-4" />{" "}
              {activeExpired ? "Renew Subscription" : "Upgrade Plan"}
            </Button>
            <Button
              variant="outline"
              className="min-h-11 rounded-xl px-5 py-2.5"
              onClick={() => setPlanPickerMode("all")}
            >
              View All Plans
            </Button>
          </div>
        </Card>

        <div className="grid gap-5">
          <Card className={cardClass}>
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              Payment method
            </p>
            <div className="mt-5 flex items-center gap-4">
              <div className="rounded-lg bg-[#1a1f71] px-4 py-3 text-sm font-black tracking-wider text-white">
                {paymentMethod?.brand?.toUpperCase() ?? "VISA"}
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {paymentMethod
                    ? `${paymentMethod.brand} ending in ${paymentMethod.last4}`
                    : "No payment method"}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {paymentMethod
                    ? `Expires ${String(paymentMethod.expiry_month).padStart(2, "0")}/${paymentMethod.expiry_year}`
                    : "Add a payment method to renew"}
                </p>
              </div>
            </div>
            {activeExpired ? (
              <span className="mt-4 inline-flex rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold uppercase text-rose-700 dark:bg-rose-400/10 dark:text-rose-300">
                Payment failed
              </span>
            ) : null}
            <button
              type="button"
              className="mt-5 text-sm font-semibold text-primary"
              onClick={() => setShowPayment(true)}
            >
              {paymentMethod ? "Update" : "Add payment method"}
            </button>
          </Card>
          <Card className={cardClass}>
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              Billing cycle
            </p>
            <CompactSelect
              value={billingCycle}
              onChange={async (value) => {
                const nextCycle = value as "Annual" | "Monthly";
                if (nextCycle === billingCycle) return;
                const result = await requestBillingCycleChange(
                  nextCycle.toLowerCase() as "monthly" | "annual",
                );
                if (!result.success) {
                  showToast(
                    "error",
                    "Unable to update billing cycle",
                    result.message,
                  );
                  return;
                }
                setOverview(result.data);
                setBillingCycle(nextCycle);
                showToast(
                  "success",
                  "Billing cycle change scheduled",
                  "Your billing cycle will change at the next renewal.",
                );
              }}
              options={[
                { label: "Annual Billing", value: "Annual" },
                { label: "Monthly Billing", value: "Monthly" },
              ]}
              className="mt-3 w-full"
              buttonClassName="min-h-11 w-full justify-between rounded-xl border px-4 text-sm font-medium shadow-none"
              darkMode={darkMode}
              ariaLabel="Billing cycle"
            />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {overview?.pending_change
                ? `Change effective ${new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(overview.pending_change.effective_at))}`
                : "No pending billing-cycle change."}
            </p>
          </Card>
        </div>
      </div>

      <Card
        className={cn(
          "mt-5 overflow-hidden rounded-[22px] border shadow-[0_20px_50px_-36px_rgba(15,23,42,0.35)]",
          surface,
        )}
      >
        <div className="px-5 py-5">
          <h2 className="text-xl font-bold">Recent Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[680px] w-full text-left text-sm">
            <thead
              className={cn(
                "text-[11px] font-bold uppercase tracking-[0.08em]",
                darkMode
                  ? "bg-slate-800 text-slate-300"
                  : "bg-slate-50 text-slate-500",
              )}
            >
              <tr>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {usedInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className={cn(
                    "border-t",
                    darkMode ? "border-slate-800" : "border-slate-100",
                  )}
                >
                  <td className="px-5 py-4 font-medium">{invoice.date}</td>
                  <td className="px-5 py-4">{invoice.amount}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      aria-label="Download invoice"
                      onClick={() => window.location.assign(`/api/subscription/invoices/${invoice.id}/download/`)}
                      className="rounded-lg p-2 text-primary hover:bg-primary/10"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {usedInvoices.length === 0 ? <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">No invoices are available for this tenant.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Card>

      {planPickerMode ? (
        <Modal
          darkMode={darkMode}
          title={planPickerMode === "upgrade" ? "Upgrade your plan" : "All plans"}
          onClose={() => setPlanPickerMode(null)}
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {planPickerMode === "upgrade"
              ? "Choose a higher plan to increase your organization’s capacity."
              : "Compare every plan available to your organization."} Plan changes are scheduled for the next renewal.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {visiblePlans.map((plan) => (
              <button
                type="button"
                key={plan.name}
                className={cn(
                  "rounded-xl border p-4 text-left transition hover:border-primary",
                  plan.name === activePlan
                    ? "border-primary ring-1 ring-primary"
                    : darkMode
                      ? "border-slate-700"
                      : "border-slate-200",
                )}
                onClick={async () => {
                  const result = await requestPlanChange(plan.name);
                  if (!result.success) {
                    showToast(
                      "error",
                      "Unable to schedule plan change",
                      result.message,
                    );
                    return;
                  }
                  setOverview(result.data);
                  setPlanPickerMode(null);
                  showToast(
                    "success",
                    "Plan change scheduled",
                    `${plan.name} will take effect at the next renewal.`,
                  );
                }}
              >
                <p className="font-bold">{plan.name}</p>
                <p className="mt-3 text-xl font-semibold">
                  {plan.prices.currency}{plan.prices.annual}
                </p>
                <p className="mt-1 text-xs text-slate-500">per year</p>
                <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <p className="flex gap-1.5">
                    <Check className="h-3.5 w-3.5 text-primary" />
                    {`${plan.limits.users ?? "Unlimited"} users`}
                  </p>
                  <p className="flex gap-1.5">
                    <Check className="h-3.5 w-3.5 text-primary" />
                    {`${plan.limits.units ?? "Unlimited"} units`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Modal>
      ) : null}
      {showPayment ? (
        <Modal
          darkMode={darkMode}
          title="Update payment method"
          onClose={() => setShowPayment(false)}
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Card details are collected securely by the payment provider.
          </p>
          <label className="mt-5 block text-sm font-semibold">
            Return to
            <Input
              className="mt-2"
              value={typeof window === "undefined" ? "" : window.location.href}
              readOnly
            />
          </label>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              className="min-h-11 rounded-xl px-4 py-2"
              onClick={() => setShowPayment(false)}
            >
              Cancel
            </Button>
            <Button
              className="min-h-11 rounded-xl px-4 py-2"
              onClick={async () => {
                const result = await createPaymentMethodSetup(
                  window.location.href,
                );
                if (!result.success) {
                  showToast(
                    "error",
                    "Unable to start payment setup",
                    result.message,
                  );
                  return;
                }
                window.location.assign(result.data.setup_url);
              }}
            >
              <CreditCard className="h-4 w-4" /> Continue securely
            </Button>
          </div>
        </Modal>
      ) : null}
      {toast ? (
        <DashboardToast
          tone={toast.tone}
          title={toast.title}
          description={toast.description}
          onClose={() => setToast(null)}
        />
      ) : null}
    </section>
  );
}

function StatusPill({ expired }: { expired: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em]",
        expired
          ? "bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300"
          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
      )}
    >
      {expired ? "Expired" : "Active"}
    </span>
  );
}
function UsageCard({
  darkMode,
  label,
  value,
  progress,
}: {
  darkMode: boolean;
  label: string;
  value: string;
  progress: number;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        darkMode
          ? "border-slate-800 bg-slate-950/30"
          : "border-slate-100 bg-slate-50",
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
function Modal({
  darkMode,
  title,
  children,
  onClose,
}: {
  darkMode: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <Card
        className={cn(
          "w-full max-w-2xl rounded-2xl border p-6 shadow-2xl",
          darkMode
            ? "border-slate-700 bg-slate-900"
            : "border-slate-200 bg-white",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-[-0.03em]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
}
