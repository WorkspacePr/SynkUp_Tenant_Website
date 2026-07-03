"use client";

import { AuthShell } from "@/components/layout/AuthShell";
import { Stepper } from "@/components/ui/Stepper";
import { cn } from "@/utils";

import type { CreationStepId } from "./types";

function getCreationPhase(step: CreationStepId): 1 | 2 | 3 {
  if (step === "verify") return 2;
  if (step === "plan" || step === "review") return 3;
  return 1;
}

function CreationFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen w-full">
      <section className="grid w-full overflow-hidden bg-card lg:grid-cols-[0.94fr_1fr]">
        {children}
      </section>
    </main>
  );
}

function CreationPanel({
  step,
  children,
  compact,
}: {
  step: CreationStepId;
  children: React.ReactNode;
  compact?: boolean;
}) {
  const phase = getCreationPhase(step);

  return (
    <div className="flex flex-col bg-[#fbfbff] px-6 py-6 sm:px-10 sm:py-8 lg:px-14 lg:py-10">
      <header className="flex items-center justify-between gap-4">
        <Stepper label={`STEP ${phase} OF 3`} phase={phase} />
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_18px_34px_-24px_rgba(13,148,136,0.9)] transition hover:bg-[#0b857b] sm:px-6"
        >
          Continue Later
        </button>
      </header>
      <div
        className={cn(
          "mx-auto flex w-full flex-1 flex-col justify-center py-10 sm:py-14",
          compact ? "max-w-124" : "max-w-4xl",
        )}
      >
        {children}
      </div>
      <footer className="flex flex-wrap gap-4 pt-6 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-secondary/70">
        <span>&copy; 2024 Architect Logic</span>
        <span>Privacy</span>
        <span>Terms</span>
      </footer>
    </div>
  );
}

export function CreationShell({
  step,
  children,
}: {
  step: CreationStepId;
  children: React.ReactNode;
}) {
  if (step === "plan") {
    return (
      <main className="flex min-h-screen w-full">
        <section className="w-full overflow-hidden bg-card">
          <div className="flex min-h-screen flex-col bg-[#f5f7fb]">
            <header className="flex items-center justify-between border-b border-border/70 bg-card px-8 py-7 lg:px-10">
              <div className="text-2xl font-extrabold tracking-[-0.04em] text-primary">
                SynkUp
              </div>
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_18px_34px_-24px_rgba(13,148,136,0.9)] transition hover:bg-[#0b857b]"
              >
                Continue Later
              </button>
            </header>
            <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-10 lg:py-10 xl:px-12">
              <div className="flex flex-1 flex-col">{children}</div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const config = {
    organisation: {
      title: "Create your organisation foundation",
      description:
        "Your digital ecosystem starts here. Build a structured environment that scales with your community's growth.",
      cards: [
        {
          title: "Organisation",
          description: "The root container for your entire ecosystem.",
          icon: "building" as const,
        },
        {
          title: "Units",
          description: "Divisions, Departments, or Chapters.",
          icon: "grid" as const,
        },
        {
          title: "Audiences",
          description: "End-users, Students, or Employees.",
          icon: "users" as const,
        },
      ],
      visual: undefined,
    },
    admin: {
      title: "Define Your Super Admin",
      description:
        "The Super Admin is the ultimate authority within your SynkUp environment. This role maintains exclusive access to sensitive system configurations, security protocols, and audit logs.",
      cards: [
        {
          title: "Unrestricted Authority",
          description:
            "Manage global settings, SSO configurations, and organizational billing without restriction.",
          icon: "shield" as const,
        },
        {
          title: "Audit Log Custodian",
          description:
            "The only role with the capability to export and view full system-wide security logs.",
          icon: "audit" as const,
        },
      ],
      visual: "governance" as const,
    },
    verify: {
      title: "Verify Your Identity",
      description:
        "To maintain a 'Logical Architect' standard of data integrity, we require a multi-factor authentication for administrative access. This ensures that your organization's hierarchy and sensitive configurations remain protected under top-tier encryption standards.",
      cards: [
        {
          title: "End-to-End Encryption",
          description:
            "Your verification tokens are hashed using SHA-256 protocols.",
          icon: "shield" as const,
        },
        {
          title: "Audit Logging",
          description:
            "Every admin verification is logged in the immutable security ledger.",
          icon: "clock" as const,
        },
      ],
      visual: undefined,
    },
    review: {
      title: "Ready for ignition.",
      description:
        "Your workspace parameters have been validated. Review your configuration to the right before finalizing the organizational structure.",
      cards: undefined,
      visual: "ignition" as const,
    },
  }[step];

  return (
    <CreationFrame>
      <AuthShell
        title={config.title}
        description={config.description}
        cards={config.cards}
        visual={config.visual}
      />
      <CreationPanel step={step} compact>
        {children}
      </CreationPanel>
    </CreationFrame>
  );
}
