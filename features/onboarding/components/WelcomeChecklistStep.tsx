import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { SparklesBoltIcon } from "@/components/ui/OnboardingIcons";
import { cn } from "@/utils";
import { Building2, LayoutGrid, UserPlus, Users } from "lucide-react";

interface WelcomeChecklistStepProps {
  activeTaskId: "profile" | "unit" | "invite" | "audience";
  completedTaskIds: Array<"profile" | "unit" | "invite" | "audience">;
  onStartTask: (taskId: "profile" | "unit" | "invite" | "audience") => void;
  onContinue: () => void;
  onGoToDashboard: () => void;
  organizationName?: string;
}

export function WelcomeChecklistStep({
  activeTaskId,
  completedTaskIds,
  onStartTask,
  onContinue,
  onGoToDashboard,
  organizationName,
}: WelcomeChecklistStepProps) {
  const tasks: Array<{
    id: "profile" | "unit" | "invite" | "audience";
    title: string;
    description: string;
    badge?: string;
    action: string;
    icon: React.ReactNode;
  }> = [
    {
      id: "profile",
      title: "Complete organization profile",
      description: "Define your entity name, logo, and time zone settings.",
      badge: "Required",
      action: "Start",
      icon: <Building2 className="h-5 w-5" strokeWidth={1.9} />,
    },
    {
      id: "unit",
      title: "Create your first unit",
      description: "Set up departments, branches, or distinct physical sites.",
      badge: "Recommended",
      action: "Create",
      icon: <LayoutGrid className="h-5 w-5" strokeWidth={1.9} />,
    },
    {
      id: "invite",
      title: "Invite admins",
      description: "Add collaborators to help manage your attendance data.",
      badge: "Optional",
      action: "Invite",
      icon: <Users className="h-5 w-5" strokeWidth={1.9} />,
    },
    {
      id: "audience",
      title: "Add audience",
      description: "Import your users or members via CSV or manual entry.",
      badge: "Recommended",
      action: "Add",
      icon: <UserPlus className="h-5 w-5" strokeWidth={1.9} />,
    },
  ];

  const completionPercent = Math.max(
    Math.round((completedTaskIds.length / tasks.length) * 100),
    25,
  );

  return (
    <div className="mx-auto max-w-270">
      <div className="text-center mb-16">
        <div className="inline-flex rounded-full bg-[#dff0ee] px-4 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Getting Started
        </div>
        <h1 className="mt-6 text-[3rem] font-bold tracking-[-0.06em] text-secondary">
          {organizationName ? `Welcome to ${organizationName}` : "Welcome to SynkUp"}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base leading-6 text-secondary/75">
          Your workspace is ready. Complete a few essentials to launch your
          {" organization's attendance system."}
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_15rem]">
        <section className="overflow-hidden rounded-[0.45rem] border border-[#cad4d9] bg-card shadow-[0_18px_48px_-40px_rgba(15,23,42,0.28)]">
          <div className="flex items-start justify-between gap-6 border-b border-[#d8e0e4] px-5 py-5 sm:px-6">
            <div>
              <div className="text-[1.05rem] font-bold tracking-[-0.03em] text-secondary">
                Setup Checklist
              </div>
              <div className="mt-1 text-sm text-secondary/75">
                {completionPercent}% complete
              </div>
            </div>
            <div className="mt-2 w-28 rounded-full bg-[#dae5fb]">
              <div
                className="h-1.5 rounded-full bg-primary transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>

          <div>
            {tasks.map((task) => {
              const isActive = activeTaskId === task.id;
              const isCompleted = completedTaskIds.includes(task.id);

              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center gap-4 border-b border-[#d8e0e4] px-5 py-5 last:border-b-0 sm:px-6",
                    isActive && "border-l-2 border-l-primary bg-[#f7fbff]",
                    isCompleted && "bg-[#f5fbf8]",
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.3rem] bg-[#dfeafc] text-primary">
                    {task.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[1rem] font-bold tracking-[-0.03em] text-secondary">
                        {task.title}
                      </h3>
                      {task.badge ? (
                        <span
                          className={cn(
                            "rounded-[0.18rem] px-1.5 py-0.5 text-[0.52rem] font-bold uppercase tracking-[0.12em]",
                            isCompleted &&
                              "bg-[#e3f5ec] text-[#157f58]",
                            !isCompleted && task.badge === "Required" &&
                              "bg-[#fde6df] text-[#d25d4f]",
                            !isCompleted && task.badge === "Recommended" &&
                              "bg-[#e9eef9] text-secondary/58",
                            !isCompleted && task.badge === "Optional" &&
                              "bg-[#e9eef9] text-secondary/58",
                          )}
                        >
                          {isCompleted ? "Completed" : task.badge}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm leading-5 text-secondary/72">
                      {task.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onStartTask(task.id)}
                    className={cn(
                      "min-w-20 shrink-0 rounded-[0.2rem] border px-5 py-2.5 text-sm font-medium transition",
                      isCompleted
                        ? "border-primary bg-white text-primary hover:bg-[#f0faf7]"
                        : isActive
                        ? "border-primary bg-primary text-white"
                        : "border-[#6e7d8b] bg-white text-secondary hover:border-primary hover:text-primary",
                    )}
                  >
                    {isCompleted ? "Edit" : task.action}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="relative overflow-hidden rounded-[0.45rem] bg-[linear-gradient(160deg,#15958b,#178c84)] px-5 py-5 text-white shadow-[0_18px_48px_-40px_rgba(15,23,42,0.35)]">
            <div className="flex h-7 w-7 items-center justify-center text-white">
              <SparklesBoltIcon className="h-8 w-8" />
            </div>
            <div className="mt-5 text-lg font-semibold tracking-[-0.03em]">
              Fast-track SynkUp
            </div>
            <p className="mt-2 max-w-48 text-sm leading-6 text-white/88">
              Need to go live today? Follow our express guide for enterprise
              integration.
            </p>
            <button
              type="button"
              className="mt-6 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-white underline decoration-white/45 underline-offset-3"
            >
              Read Setup Docs
            </button>
            <div className="absolute -bottom-2 -right-2 h-18 w-18 rounded-full border-10 border-white/12" />
            <div className="absolute bottom-2 right-3 h-9 w-9 rounded-full border-[6px] border-white/12" />
          </div>

          <div className="overflow-hidden rounded-[0.45rem] border border-[#cad4d9] shadow-[0_18px_48px_-40px_rgba(15,23,42,0.28)]">
            <div className="relative aspect-square w-full">
              <Image
                src="/images/onboarding/welcome-checklist-illustration.png"
                alt="Analytics laptop illustration for onboarding checklist"
                fill
                sizes="(max-width: 1280px) 100vw, 240px"
                className="object-cover"
              />
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-10 flex items-center justify-center gap-8">
        <Button type="button" className="rounded-md px-10 py-3" onClick={onContinue}>
          Continue Setup
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
        <button
          type="button"
          className="text-sm font-semibold text-primary"
          onClick={onGoToDashboard}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
