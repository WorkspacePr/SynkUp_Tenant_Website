import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";
import { FormError } from "@/components/ui/FormError";
import type { OrganizationOnboardingLaunchChecklist } from "@/types/onboarding";

interface CompletionStepProps {
  checklist: OrganizationOnboardingLaunchChecklist | null;
  isLoadingChecklist?: boolean;
  isLaunching?: boolean;
  launchError?: string | null;
  onBack: () => void;
  onLaunch: () => void;
}

function formatPlanName(planName: string) {
  return planName
    .trim()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function CompletionStep({
  checklist,
  isLoadingChecklist,
  isLaunching,
  launchError,
  onBack,
  onLaunch,
}: CompletionStepProps) {
  const isLaunched = Boolean(checklist?.launch_completed_at);
  const items = [
    checklist?.organization_name
      ? `Organization ready: ${checklist.organization_name}`
      : "Organization profile ready",
    `${checklist?.unit_count ?? 0} unit${checklist?.unit_count === 1 ? "" : "s"} set up`,
    `${checklist?.audience_count ?? 0} audience${checklist?.audience_count === 1 ? "" : "s"} added`,
    `${checklist?.active_admin_count ?? 0} active admin${checklist?.active_admin_count === 1 ? "" : "s"}`,
    `${checklist?.pending_invite_count ?? 0} pending invite${checklist?.pending_invite_count === 1 ? "" : "s"}`,
    checklist?.plan_name
      ? `Plan: ${formatPlanName(checklist.plan_name)}`
      : "Plan selected",
  ];

  return (
    <div className="mx-auto grid max-w-245 items-start gap-8 lg:grid-cols-[0.8fr_0.36fr]">
      <section className="rounded-[0.35rem] border border-border bg-card p-8 shadow-[0_22px_50px_-38px_rgba(15,23,42,0.3)] lg:p-10">
        <div className="max-w-104">
          <h2 className="text-[3rem] font-bold tracking-[-0.06em] text-secondary">
            {isLaunched
              ? "Your SynkUp workspace is live"
              : "Your SynkUp workspace is ready"}
          </h2>
          <p className="mt-3 text-base leading-6 text-secondary/75">
            {isLaunched
              ? "Onboarding is complete. You can now start managing attendance, creating sessions, and viewing reports."
              : "Review the final readiness checklist, then launch the organization when everything looks good."}
          </p>
        </div>

        <div className="mt-8 rounded-[0.35rem] border border-border p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-base font-bold text-secondary">Launch Checklist</div>
            {checklist ? (
              <span
                className={
                  checklist.can_launch
                    ? "rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-primary"
                    : "rounded-full bg-[#fff3dc] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#9a5b00]"
                }
              >
                {checklist.can_launch ? "Ready" : "Blocked"}
              </span>
            ) : null}
          </div>
          <div className="mt-4 space-y-3">
            {isLoadingChecklist ? (
              <div className="text-sm font-medium text-secondary/65">
                Loading launch checklist...
              </div>
            ) : null}
            {!isLoadingChecklist ? items.map((item) => (
              <div key={item} className="flex items-center gap-3 text-base text-secondary/88">
                <span className="inline-flex p-2 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckIcon className="h-4 w-4" />
                </span>
                <span>{item}</span>
              </div>
            )) : null}
          </div>
        </div>

        {checklist?.blocking_issues.length ? (
          <div className="mt-5 rounded-[0.35rem] border border-[#ffd9c2] bg-[#fff7f0] p-4">
            <div className="text-sm font-bold text-secondary">
              Things to fix before launch
            </div>
            <div className="mt-3 space-y-2">
              {checklist.blocking_issues.map((issue) => (
                <div key={`${issue.code}-${issue.step_key}`} className="text-sm text-secondary/78">
                  {issue.message}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {checklist?.warnings.length ? (
          <div className="mt-5 rounded-[0.35rem] border border-[#d7ecec] bg-[#f2fbfb] p-4">
            <div className="text-sm font-bold text-secondary">Warnings</div>
            <div className="mt-3 space-y-2">
              {checklist.warnings.map((warning) => (
                <div key={`${warning.code}-${warning.step_key}`} className="text-sm text-secondary/78">
                  {warning.message}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {launchError ? <FormError className="mt-5" message={launchError} /> : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-md px-8 py-3"
            onClick={onBack}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-md px-8 py-3"
            onClick={onLaunch}
            loading={isLaunching}
            disabled={isLoadingChecklist || !checklist?.can_launch || isLaunched}
          >
            {isLaunched ? "Organization Launched" : "Launch Organization"}
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <aside className="pt-10">
        <div className="overflow-hidden rounded-[0.35rem] border border-border bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.35),transparent_28%),linear-gradient(160deg,#dbe8e9,#7c9fa4_36%,#314757)] p-5 shadow-[0_22px_50px_-38px_rgba(15,23,42,0.3)]">
          <div className="relative mx-auto mt-3 aspect-square max-w-48 overflow-hidden rounded-lg">
            <Image
              src="/images/onboarding/completion-illustration.png"
              alt="Completion success illustration"
              fill
              sizes="(max-width: 1024px) 100vw, 192px"
              className="object-cover"
            />
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#136e67] px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white">
            <CheckIcon className="h-3.5 w-3.5" />
            {isLaunched ? "Deployment Successful" : "Ready To Launch"}
          </div>
        </div>
      </aside>
    </div>
  );
}
