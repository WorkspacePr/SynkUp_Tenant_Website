"use client";

import { AuthShell } from "@/components/layout/AuthShell";
import { Stepper } from "@/components/ui/Stepper";
import { cn } from "@/utils";

interface AuthExperienceShellProps {
  stageTitle: string;
  stageDescription: string;
  stageFooter: string;
  children: React.ReactNode;
  stepperLabel?: string;
  stepperPhase?: 1 | 2 | 3;
  hideContinueLater?: boolean;
  compact?: boolean;
}

export function AuthExperienceShell({
  stageTitle,
  stageDescription,
  stageFooter,
  children,
  stepperLabel,
  stepperPhase,
  hideContinueLater,
  compact,
}: AuthExperienceShellProps) {
  return (
    <main className="flex min-h-screen w-full">
      <section className="grid w-full overflow-hidden bg-card lg:grid-cols-[0.94fr_1fr]">
        <AuthShell title={stageTitle} description={stageDescription}>
          <div className="flex items-center gap-2 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-white/70">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/20">
              <span className="block h-1.5 w-1.5 rounded-full bg-white/80" />
            </span>
            {stageFooter}
          </div>
        </AuthShell>

        <div className="flex flex-col bg-[#fbfbff] px-6 py-6 sm:px-10 sm:py-8 lg:px-14 lg:py-10">
          {/* <header className="flex items-center justify-between gap-4">
            <div>
              {stepperLabel && stepperPhase ? (
                <Stepper label={stepperLabel} phase={stepperPhase} />
              ) : null}
            </div>
            {!hideContinueLater ? (
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_18px_34px_-24px_rgba(13,148,136,0.9)] transition hover:bg-[#0b857b] sm:px-6"
              >
                Continue Later
              </button>
            ) : null}
          </header> */}

          <div
            className={cn(
              "mx-auto flex w-full flex-1 flex-col justify-center py-10 sm:py-14",
              compact ? "max-w-md" : "max-w-124",
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
      </section>
    </main>
  );
}
