"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Menu, Search } from "lucide-react";

import { cn } from "@/utils";

import { CommandSearchBar, CompactSelect } from "../cards/ShowcaseParts";
import type { CommandBarConfig, RoleKey, SelectOption } from "../types";

type ShowcaseNavbarProps = {
  darkMode: boolean;
  role: RoleKey;
  roleLabel: string;
  roleOptions: SelectOption[];
  activeScope: string;
  compactScopeLabel: string;
  scopeOptions: SelectOption[];
  onRoleChange: (value: string) => void;
  onScopeChange: (value: string) => void;
  onToggleSidebar: () => void;
  onLogout: () => void;
  isLoggingOut?: boolean;
  commandBar?: CommandBarConfig;
};

export function ShowcaseNavbar({
  darkMode,
  role,
  roleLabel,
  roleOptions,
  activeScope,
  compactScopeLabel,
  scopeOptions,
  onRoleChange,
  onScopeChange,
  onToggleSidebar,
  onLogout,
  isLoggingOut = false,
  commandBar,
}: ShowcaseNavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-20 shrink-0 border-b px-4 py-3 sm:px-8 sm:py-4 lg:px-8",
        darkMode ? "border-slate-800 bg-[#09131f]" : "border-slate-100 bg-white",
      )}
    >
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          className={cn(
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            darkMode ? "bg-slate-900 text-white" : "text-slate-900",
          )}
        >
          <Menu className="h-7 w-7" />
        </button>

        {commandBar ? (
          <div className="hidden min-w-0 flex-1 md:flex md:max-w-105">
            <CommandSearchBar commandBar={commandBar} darkMode={darkMode} />
          </div>
        ) : (
          <div
            className={cn(
              "hidden min-h-12 flex-1 items-center gap-3 rounded-lg px-4 md:flex md:max-w-105",
              darkMode ? "bg-slate-900 text-slate-400" : "bg-slate-100 text-slate-400",
            )}
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">
              Search users, units, audiences, sessions...
            </span>
          </div>
        )}

        <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
          <CompactSelect
            value={role}
            options={roleOptions}
            onChange={onRoleChange}
            className="w-39 min-w-0 sm:w-auto sm:min-w-37.5"
            buttonClassName="border-transparent bg-[#8fd3cf] font-bold tracking-[0.08em] text-[#173433]"
            darkMode={darkMode}
          />

          <CompactSelect
            value={activeScope}
            options={scopeOptions}
            onChange={onScopeChange}
            className="hidden min-w-40 max-w-47.5 xl:block"
            buttonClassName={cn(
              darkMode
                ? "border-slate-700 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700",
            )}
            darkMode={darkMode}
          />

          <CompactSelect
            value={activeScope}
            options={[
              { label: compactScopeLabel, value: activeScope },
              ...scopeOptions.filter((option) => option.value !== activeScope),
            ]}
            onChange={onScopeChange}
            className="hidden min-w-31 max-w-35 md:block xl:hidden"
            buttonClassName={cn(
              darkMode
                ? "border-slate-700 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700",
            )}
            darkMode={darkMode}
          />

          <button
            type="button"
            className={cn(
              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              darkMode ? "text-white" : "text-slate-900",
            )}
          >
            <Bell className="h-5 w-5" />
          </button>

          <div ref={profileRef} className="relative flex items-center gap-3">
            <button
              type="button"
              onClick={() => setProfileOpen((current) => !current)}
              className={cn(
                "flex items-center gap-3 rounded-full transition",
                profileOpen && (darkMode ? "bg-slate-900/70" : "bg-slate-100"),
              )}
            >
              <div className="hidden text-right sm:block">
                <div
                  className={cn(
                    "text-sm font-semibold",
                    darkMode ? "text-white" : "text-slate-900",
                  )}
                >
                  John Doe
                </div>
                <div
                  className={cn(
                    "text-[11px]",
                    darkMode ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  {roleLabel}
                </div>
              </div>
              <div className="h-11 w-11 rounded-full bg-[radial-gradient(circle_at_top,#6b7280,#111827)]" />
            </button>

            {profileOpen ? (
              <div
                className={cn(
                  "absolute right-0 top-[calc(100%+0.75rem)] z-30 w-72 rounded-3xl border p-4 shadow-[0_24px_48px_-28px_rgba(15,23,42,0.42)]",
                  darkMode
                    ? "border-slate-700 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-900",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-[radial-gradient(circle_at_top,#6b7280,#111827)]" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">John Doe</div>
                    <div
                      className={cn(
                        "truncate text-xs",
                        darkMode ? "text-slate-400" : "text-slate-500",
                      )}
                    >
                      john.doe@synkup.edu
                    </div>
                  </div>
                </div>

                <div
                  className={cn(
                    "mt-4 rounded-2xl border p-3",
                    darkMode
                      ? "border-slate-800 bg-slate-950/40"
                      : "border-slate-100 bg-slate-50",
                  )}
                >
                  <div
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-[0.12em]",
                      darkMode ? "text-slate-500" : "text-slate-400",
                    )}
                  >
                    Current Role
                  </div>
                  <div className="mt-1 text-sm font-semibold">{roleLabel}</div>
                  <div
                    className={cn(
                      "mt-3 text-[11px] font-semibold uppercase tracking-[0.12em]",
                      darkMode ? "text-slate-500" : "text-slate-400",
                    )}
                  >
                    Scope
                  </div>
                  <div
                    className={cn(
                      "mt-1 text-sm",
                      darkMode ? "text-slate-300" : "text-slate-600",
                    )}
                  >
                    {activeScope}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition",
                      darkMode
                        ? "text-slate-200 hover:bg-slate-800"
                        : "text-slate-700 hover:bg-slate-50",
                    )}
                  >
                    <span>My Profile</span>
                    <span className={cn(darkMode ? "text-slate-500" : "text-slate-400")}>
                      View
                    </span>
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition",
                      darkMode
                        ? "text-slate-200 hover:bg-slate-800"
                        : "text-slate-700 hover:bg-slate-50",
                    )}
                  >
                    <span>Account Settings</span>
                    <span className={cn(darkMode ? "text-slate-500" : "text-slate-400")}>
                      Open
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    disabled={isLoggingOut}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
                      darkMode
                        ? "text-rose-200 hover:bg-slate-800"
                        : "text-rose-600 hover:bg-rose-50",
                    )}
                  >
                    <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
                    <span className={cn(darkMode ? "text-rose-300/70" : "text-rose-400")}>
                      Exit
                    </span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-3 md:hidden">
        {commandBar ? (
          <CommandSearchBar commandBar={commandBar} darkMode={darkMode} />
        ) : (
          <div
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-xl px-4",
              darkMode ? "bg-slate-900 text-slate-400" : "bg-slate-100 text-slate-400",
            )}
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">
              Search users, units, audiences, sessions...
            </span>
          </div>
        )}

        <CompactSelect
          value={activeScope}
          options={[
            { label: compactScopeLabel, value: activeScope },
            ...scopeOptions.filter((option) => option.value !== activeScope),
          ]}
          onChange={onScopeChange}
          className="w-full"
          buttonClassName={cn(
            darkMode
              ? "border-slate-700 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-700",
          )}
          darkMode={darkMode}
        />
      </div>
    </header>
  );
}
