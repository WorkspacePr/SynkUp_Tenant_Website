import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";
import type { OrganizationOnboardingReviewPayload } from "@/types/onboarding";

interface ReviewDetailsStepProps {
  review: OrganizationOnboardingReviewPayload | null;
  isLoading?: boolean;
  isCompleting?: boolean;
  error?: string | null;
  onBack: () => void;
  onContinue: () => void;
}

export function ReviewDetailsStep({
  review,
  isLoading,
  isCompleting,
  error,
  onBack,
  onContinue,
}: ReviewDetailsStepProps) {
  const organization = review?.organization;
  const primaryAdmin = review?.primary_admin;
  const subscription = review?.subscription;
  const blockingIssues =
    review?.blocking_issues.filter(
      (issue) => issue.step_key !== "review_details",
    ) ?? [];

  return (
    <div className="mx-auto max-w-245">
      <section className="rounded-[0.35rem] border border-border bg-card p-8 shadow-[0_22px_50px_-38px_rgba(15,23,42,0.3)] lg:p-10">
        <div className="max-w-130">
          <div className="inline-flex rounded-full bg-[#dff0ee] px-4 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Final Review
          </div>
          <h2 className="mt-5 text-[3rem] font-bold tracking-[-0.06em] text-secondary">
            Review workspace details
          </h2>
          <p className="mt-3 text-base leading-6 text-secondary/75">
            Confirm these setup details before launching the organization.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-8 rounded-[0.35rem] border border-border bg-[#fbfdff] p-5 text-sm font-semibold text-secondary/70">
            Loading review details...
          </div>
        ) : null}

        {!isLoading && review ? (
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <ReviewCard title="Organization">
              <ReviewRow label="Name" value={organization?.name} />
              <ReviewRow label="Type" value={organization?.organization_type} />
              <ReviewRow label="Industry" value={organization?.industry_sector} />
              <ReviewRow label="Email" value={organization?.official_email} />
              <ReviewRow
                label="URL"
                value={
                  organization?.subdomain
                    ? `${organization.subdomain}.synkup.app`
                    : undefined
                }
              />
            </ReviewCard>

            <ReviewCard title="Primary Admin">
              <ReviewRow
                label="Name"
                value={[primaryAdmin?.first_name, primaryAdmin?.last_name]
                  .filter(Boolean)
                  .join(" ")}
              />
              <ReviewRow label="Email" value={primaryAdmin?.email} />
              <ReviewRow label="Membership" value={primaryAdmin?.membership_type} />
              <ReviewRow label="Plan" value={subscription?.plan} />
            </ReviewCard>

            <ReviewCard title="Setup Summary">
              <SummaryPill label="Units" value={review.unit_count} />
              <SummaryPill label="Audiences" value={review.audience_count} />
              <SummaryPill label="Invited admins" value={review.invited_admin_count} />
              <SummaryPill
                label="Pending invites"
                value={review.pending_admin_invite_count}
              />
            </ReviewCard>

            <ReviewCard title="Launch Readiness">
              {blockingIssues.length > 0 ? (
                <div className="space-y-2">
                  {blockingIssues.map((issue) => (
                    <div
                      key={`${issue.code}-${issue.step_key}`}
                      className="rounded-[0.3rem] bg-[#fff7f0] px-3 py-2 text-sm text-secondary/80"
                    >
                      {issue.message}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-[0.3rem] bg-[#f2fbf8] px-3 py-3 text-sm font-semibold text-primary">
                  <CheckIcon className="h-4 w-4" />
                  Ready to confirm review details.
                </div>
              )}
            </ReviewCard>
          </div>
        ) : null}

        {error ? <FormError className="mt-5" message={error} /> : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-md px-8 py-3"
            onClick={onBack}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Button>
          <Button
            type="button"
            className="rounded-md px-8 py-3"
            onClick={onContinue}
            loading={isCompleting}
            disabled={isLoading || !review || blockingIssues.length > 0}
          >
            Confirm Review
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}

function ReviewCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[0.35rem] border border-border bg-[#fbfdff] p-5">
      <div className="text-base font-bold text-secondary">{title}</div>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="font-bold uppercase tracking-[0.12em] text-secondary/45">
        {label}
      </span>
      <span className="text-right font-semibold text-secondary">
        {value || "Not provided"}
      </span>
    </div>
  );
}

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-[0.3rem] bg-white px-3 py-3 text-sm">
      <span className="font-semibold text-secondary/72">{label}</span>
      <span className="rounded-full bg-primary/10 px-3 py-1 font-bold text-primary">
        {value}
      </span>
    </div>
  );
}
