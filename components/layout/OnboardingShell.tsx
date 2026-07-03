import { BellIcon, CircleHelpIcon, SynkUpMarkIcon } from "@/components/ui/OnboardingIcons";

interface OnboardingShellProps {
  children: React.ReactNode;
}

export function OnboardingShell({ children }: OnboardingShellProps) {
  return (
    <main className="min-h-screen bg-background">
      <div className="flex min-h-screen w-full flex-col">
        <header className="flex items-center justify-between border-b border-border/70 bg-card px-6 py-4">
          <div className="flex items-center gap-2 text-primary">
            <SynkUpMarkIcon className="h-6 w-6" />
            <span className="text-lg font-extrabold tracking-[-0.04em]">SynkUp</span>
          </div>
          <div className="hidden items-center gap-8 text-sm text-secondary/85 sm:flex">
            <button type="button" className="transition hover:text-secondary">
              Support
            </button>
            <button type="button" className="transition hover:text-secondary">
              Documentation
            </button>
          </div>
          <div className="flex items-center gap-3 text-secondary/85">
            <button type="button" className="rounded-full p-1.5 transition hover:bg-muted">
              <CircleHelpIcon className="h-6 w-6" />
            </button>
            <button type="button" className="rounded-full p-1.5 transition hover:bg-muted">
              <BellIcon className="h-6 w-6" />
            </button>
            <div className="flex px-2 py-1.5 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f0b39d,#7d8da5)] text-sm font-bold text-white">
              AT
            </div>
          </div>
        </header>
        <div className="flex-1 bg-[#f7f8fb] px-4 py-8 sm:px-6 lg:px-10 lg:py-10 xl:px-12">
          {children}
        </div>
        <footer className="flex items-center justify-between border-t border-border/70 bg-card px-6 py-4 text-sm text-secondary/75">
          <div className="flex items-center gap-2 text-primary">
            <SynkUpMarkIcon className="h-5 w-5" />
            <span className="font-bold">SynkUp</span>
          </div>
          <div>&copy; 2026 SynkUp. Admin Panel v1.0</div>
          <div className="hidden gap-5 sm:flex">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Status</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
