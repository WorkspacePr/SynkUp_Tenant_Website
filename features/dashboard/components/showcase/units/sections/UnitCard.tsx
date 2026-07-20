"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Eye,
  FileSpreadsheet,
  MoreVertical,
  Pencil,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";
import {
  ArchiveUnitModal,
  AssignAdminModal,
  EditUnitModal,
} from "../modals";
import {
  AvatarSeed,
  StatBlock,
  UnitStatusPill,
} from "../shared";
import type { UnitSummary } from "../types";

type UnitCardAction =
  | {
      label: string;
      icon: ReactNode;
      href: string;
      onClick?: never;
      tone?: never;
    }
  | {
      label: string;
      icon: ReactNode;
      onClick: () => void;
      tone?: "danger";
      href?: never;
    };

export function UnitCard({
  darkMode,
  unit,
}: {
  darkMode: boolean;
  unit: UnitSummary;
}) {
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [editUnitOpen, setEditUnitOpen] = useState(false);
  const [assignAdminOpen, setAssignAdminOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const actionItems: UnitCardAction[] = [
    {
      label: "Edit Unit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: () => setEditUnitOpen(true),
    },
    {
      label: "Assign / Reassign Unit Admin",
      icon: <UserCog className="h-4 w-4" />,
      onClick: () => setAssignAdminOpen(true),
    },
    {
      label: "Archive Unit",
      icon: <Trash2 className="h-4 w-4" />,
      tone: "danger" as const,
      onClick: () => setArchiveOpen(true),
    },
    {
      label: "View Unit Audit",
      icon: <ClipboardList className="h-4 w-4" />,
      href: `/dashboard/units/${unit.id}`,
    },
    {
      label: "View Users in Unit",
      icon: <Users className="h-4 w-4" />,
      href: `/dashboard/units/${unit.id}`,
    },
    {
      label: "View Audiences",
      icon: <Eye className="h-4 w-4" />,
      href: `/dashboard/units/${unit.id}`,
    },
    {
      label: "Generate Unit Report",
      icon: <FileSpreadsheet className="h-4 w-4" />,
      href: `/dashboard/units/${unit.id}`,
    },
  ];

  return (
    <>
      <Card
        className={cn(
          "overflow-hidden rounded-[22px] border shadow-[0_24px_60px_-40px_rgba(15,23,42,0.4)]",
          darkMode
            ? "border-slate-800 bg-slate-900 text-white"
            : "border-slate-100 bg-white",
        )}
      >
        <div className="flex items-start justify-between px-6 pt-4">
          <UnitStatusPill status={unit.lifecycleStatus} />
          <div className="relative">
            <button
              type="button"
              onClick={() => setActionMenuOpen((current) => !current)}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition",
                darkMode
                  ? "border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-900"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              )}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {actionMenuOpen ? (
              <div
                className={cn(
                  "absolute right-0 top-[calc(100%+0.5rem)] z-20 min-w-65 rounded-2xl border p-2 shadow-[0_24px_48px_-28px_rgba(15,23,42,0.42)]",
                  darkMode
                    ? "border-slate-700 bg-slate-900"
                    : "border-slate-200 bg-white",
                )}
              >
                {actionItems.map((item) =>
                  item.href ? (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setActionMenuOpen(false)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
                        darkMode
                          ? "text-slate-200 hover:bg-slate-800"
                          : "text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ) : (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setActionMenuOpen(false);
                        item.onClick?.();
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
                        item.tone === "danger"
                          ? "text-[#dc2626] hover:bg-[#fff1f1]"
                          : darkMode
                            ? "text-slate-200 hover:bg-slate-800"
                            : "text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ),
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="px-6 pb-4 pt-3">
          <div className="text-[2rem] font-semibold tracking-[-0.04em]">
            {unit.name}
          </div>
        </div>

        <div
          className={cn(
            "grid grid-cols-3 border-y",
            darkMode ? "border-slate-800" : "border-slate-200",
          )}
        >
          <StatBlock darkMode={darkMode} label="Total Users" value={unit.totalUsers} />
          <StatBlock darkMode={darkMode} label="Audiences" value={unit.audiences} />
          <StatBlock
            darkMode={darkMode}
            label="Sessions"
            value={unit.sessions}
            valueClassName="text-[#22c55e]"
          />
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold">ASSIGNED ADMINS</div>
            <Link
              href={`/dashboard/units/${unit.id}`}
              className="text-xs font-bold text-[#16a394]"
            >
              View Unit Audit
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {unit.admins.map((admin) => (
              <div key={admin} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-sm">
                  <AvatarSeed seed={admin} />
                  <span>{admin}</span>
                </div>
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-[9px] font-bold uppercase",
                    darkMode
                      ? "bg-slate-800 text-slate-300"
                      : "bg-[#eeeeee] text-slate-500",
                  )}
                >
                  Admin
                </span>
              </div>
            ))}
          </div>

          <div
            className={cn(
              "mt-4 rounded-2xl border px-4 py-3 text-sm",
              darkMode
                ? "border-[#5b3b45] bg-[#24151b] text-slate-200"
                : "border-[#fee2e2] bg-[#fff8f8] text-slate-700",
            )}
          >
            <div className="font-semibold text-[#dc2626]">
              Critical Alerts: {unit.criticalAlertsCount}
            </div>
            <div
              className={cn(
                "mt-1 text-xs",
                darkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              Includes session failures, sync backlog, missing admins, disputes, and validation issues.
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              href={`/dashboard/units/${unit.id}`}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_18px_34px_-24px_rgba(13,148,136,0.9)] transition hover:bg-[#0b857b]"
            >
              View Unit
            </Link>
            <Button
              variant="outline"
              className="min-h-11 rounded-xl px-5 py-3 text-sm"
              onClick={() => setEditUnitOpen(true)}
            >
              Edit Unit
            </Button>
          </div>
        </div>
      </Card>

      <EditUnitModal
        key={`card-edit-${unit.id}-${editUnitOpen ? "open" : "closed"}`}
        darkMode={darkMode}
        open={editUnitOpen}
        onClose={() => setEditUnitOpen(false)}
        unit={unit}
      />
      <AssignAdminModal
        darkMode={darkMode}
        open={assignAdminOpen}
        onClose={() => setAssignAdminOpen(false)}
        unit={unit}
      />
      <ArchiveUnitModal
        darkMode={darkMode}
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        unit={unit}
      />
    </>
  );
}
