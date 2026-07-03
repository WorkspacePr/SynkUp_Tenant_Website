"use client";

import { Controller, useWatch } from "react-hook-form";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Trash2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { InfoCircleIcon } from "@/components/ui/OnboardingIcons";
import { Select } from "@/components/ui/Select";
import type { SelectOption } from "@/components/ui/Select";
import type {
  OnboardingFormValues,
  OrganizationOnboardingAdminInvite,
} from "@/types/onboarding";

interface InviteAdminsStepProps {
  control: Control<OnboardingFormValues>;
  register: UseFormRegister<OnboardingFormValues>;
  errors: FieldErrors<OnboardingFormValues>;
  onSendInvite: (
    invites: Array<{
      email: string;
      role: string;
      unitId?: string;
      audienceId?: string;
    }>,
  ) => void;
  onContinue: () => void;
  onSkip: () => void;
  isSendingInvite?: boolean;
  roleOptions: SelectOption[];
  isRoleOptionsLoading?: boolean;
  unitOptions: SelectOption[];
  audienceOptions: SelectOption[];
  existingInvites?: OrganizationOnboardingAdminInvite[];
  onRevokeInvite: (inviteId: number) => void;
  revokingInviteId?: number | null;
}

export function InviteAdminsStep({
  control,
  register,
  errors,
  onSendInvite,
  onContinue,
  onSkip,
  isSendingInvite,
  roleOptions,
  isRoleOptionsLoading,
  unitOptions,
  audienceOptions,
  existingInvites = [],
  onRevokeInvite,
  revokingInviteId,
}: InviteAdminsStepProps) {
  const primaryInviteEmail = useWatch({ control, name: "inviteEmail" }) ?? "";
  const primaryInviteRole = useWatch({ control, name: "inviteRole" }) ?? "";
  const primaryInviteUnitId = useWatch({ control, name: "inviteUnitId" }) ?? "";
  const primaryInviteAudienceId =
    useWatch({ control, name: "inviteAudienceId" }) ?? "";
  const shouldSelectUnit = primaryInviteRole.toLowerCase().includes("unit");
  const shouldSelectAudience = primaryInviteRole
    .toLowerCase()
    .includes("audience");

  function getStatusClasses(status: string) {
    const normalizedStatus = status.trim().toLowerCase();

    if (normalizedStatus === "pending") {
      return "bg-[#e9f5f4] text-primary";
    }

    if (normalizedStatus === "accepted") {
      return "bg-[#ecfdf3] text-[#157347]";
    }

    if (normalizedStatus === "revoked") {
      return "bg-[#fdf0f0] text-destructive";
    }

    if (normalizedStatus === "expired") {
      return "bg-[#f5f5f5] text-secondary/75";
    }

    return "bg-[#edf2f7] text-secondary/75";
  }

  return (
    <div className="mx-auto grid max-w-280 gap-5 lg:grid-cols-[1fr_0.56fr]">
      <section className="rounded-[0.45rem] border border-border bg-card p-8 shadow-[0_22px_50px_-38px_rgba(15,23,42,0.3)] lg:p-10">
        <h2 className="text-[2.55rem] font-bold tracking-[-0.06em] text-secondary">
          Invite admins
        </h2>
        <p className="mt-2 max-w-136 text-base leading-6 text-secondary/75">
          Add administrators to help manage your SynkUp environment. Send one
          invite at a time, then manage the invited queue below.
        </p>

        <div className="mt-8 inline-flex items-center gap-2 text-base font-semibold text-primary">
          <UserPlus className="h-6 w-6" strokeWidth={1.9} />
          <span>Send Invitation</span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_0.92fr]">
          <div className="flex flex-col gap-1">
            <Label htmlFor="inviteEmail">Email Address</Label>
            <Input
              id="inviteEmail"
              placeholder="e.g. sarah.j@company.com"
              error={Boolean(errors.inviteEmail)}
              {...register("inviteEmail")}
            />
            <FormError message={errors.inviteEmail?.message} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="inviteRole">Assign Role</Label>
            <Controller
              name="inviteRole"
              control={control}
              render={({ field }) => (
                <Select
                  id="inviteRole"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Select role"
                  options={roleOptions}
                  loading={isRoleOptionsLoading}
                />
              )}
            />
          </div>
        </div>

        {shouldSelectUnit || shouldSelectAudience ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {shouldSelectUnit ? (
              <div className="flex flex-col gap-1">
                <Label htmlFor="inviteUnitId">Unit</Label>
                <Controller
                  name="inviteUnitId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="inviteUnitId"
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Select unit"
                      options={unitOptions}
                    />
                  )}
                />
              </div>
            ) : null}
            {shouldSelectAudience ? (
              <div className="flex flex-col gap-1">
                <Label htmlFor="inviteAudienceId">Audience</Label>
                <Controller
                  name="inviteAudienceId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="inviteAudienceId"
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Select audience"
                      options={audienceOptions}
                    />
                  )}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6">
          <Button
            type="button"
            className="min-w-42 rounded-md px-8 py-3"
            onClick={() =>
              onSendInvite([
                {
                  email: primaryInviteEmail,
                  role: primaryInviteRole,
                  unitId: primaryInviteUnitId,
                  audienceId: primaryInviteAudienceId,
                },
              ])
            }
            loading={isSendingInvite}
          >
            Send Invite
          </Button>
        </div>

        <div className="mt-10 rounded-[0.35rem] border border-border bg-[#f7fafc] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Invite Queue
          </div>

          {existingInvites.length > 0 ? (
            <div className="mt-4 space-y-3">
              {existingInvites.map((invite, index) => (
                <div
                  key={invite.invite_id}
                  className="grid gap-4 rounded-[0.35rem] border border-border px-4 py-4 sm:grid-cols-[1fr_0.92fr_auto]"
                >
                  <div className="flex flex-col gap-1">
                    <Label htmlFor={`queueInviteEmail-${invite.invite_id}`}>
                      Email Address
                    </Label>
                    <Input
                      id={`queueInviteEmail-${invite.invite_id}`}
                      value={invite.invited_email}
                      disabled
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor={`queueInviteRole-${invite.invite_id}`}>
                      Role
                    </Label>
                    <div>
                      <Select
                        id={`queueInviteRole-${invite.invite_id}`}
                        value={invite.invited_role_name}
                        options={roleOptions}
                        loading={isRoleOptionsLoading}
                        disabled
                      />
                      <span
                        className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] ${getStatusClasses(
                          invite.status,
                        )}`}
                      >
                        {invite.status}
                      </span>
                      {invite.invited_unit_name || invite.invited_audience_name ? (
                        <div className="mt-2 text-xs text-secondary/65">
                          {[invite.invited_unit_name, invite.invited_audience_name]
                            .filter(Boolean)
                            .join(" / ")}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      aria-label={`Remove invited admin ${index + 1}`}
                      onClick={() => onRevokeInvite(invite.invite_id)}
                      loading={revokingInviteId === invite.invite_id}
                      className="h-[3.65rem] w-[3.65rem] rounded-md px-0 py-0 text-secondary/65 hover:border-[#e7b4b4] hover:text-destructive"
                    >
                      {revokingInviteId === invite.invite_id ? null : (
                        <Trash2 className="h-5 w-5" strokeWidth={1.9} />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[0.35rem] border border-dashed border-border px-4 py-6 text-sm text-secondary/65">
              No invited admins yet.
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-[0.35rem] bg-[#ebf8f8] px-4 py-4 text-base text-secondary/82">
          <InfoCircleIcon className="h-6 w-6 text-primary" />
          <span>You can invite more admins later from Team Settings.</span>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button
            type="button"
            className="min-w-34 rounded-md px-8 py-3"
            onClick={onContinue}
          >
            Continue
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-w-34 rounded-md px-8 py-3 text-secondary"
            onClick={onSkip}
          >
            Invite Later
          </Button>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="overflow-hidden rounded-[0.45rem] border border-[#c9d8ef] bg-[#dfeafc] shadow-[0_18px_44px_-36px_rgba(15,23,42,0.22)]">
          <div className="border-b border-[#c9d8ef] px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Role Definitions
          </div>
          <div className="space-y-0">
            {[
              [
                "Super Admin",
                "Full system control. Can manage billing, global settings, and all other administrators.",
              ],
              [
                "Unit Admin",
                "Manages a specific organizational unit. Can create sub-units and assign local users.",
              ],
              [
                "Audience Admin",
                "Focused on user lists and segmentation. No access to system configurations.",
              ],
            ].map(([title, description], index) => (
              <div
                key={title}
                className={`px-6 py-5 ${index < 2 ? "border-b border-[#c9d8ef]" : ""}`}
              >
                <h3 className="text-lg font-semibold tracking-[-0.03em] text-secondary">
                  {title}
                </h3>
                <p className="mt-2 text-base leading-6 text-secondary/72">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[0.45rem] border border-border bg-[linear-gradient(180deg,#97a3b2,#6c7a8f)] p-4 shadow-[0_18px_44px_-36px_rgba(15,23,42,0.28)]">
          <div className="h-38 rounded-[0.35rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
          <div className="pointer-events-none absolute inset-x-6 bottom-6 text-xs leading-5 text-white/90">
            Collaboration is the core of SynkUp&apos;s technical mastery.
          </div>
        </div>
      </aside>
    </div>
  );
}
