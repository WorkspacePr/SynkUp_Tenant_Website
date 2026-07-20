"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/utils";

type BreadcrumbItem = {
  label: string;
  active?: boolean;
};

export function UnitsPageHeader({
  darkMode,
  title,
  description,
  breadcrumb = [],
  backHref,
  backLabel,
  actionSlot,
}: {
  darkMode: boolean;
  title: string;
  description: string;
  breadcrumb?: BreadcrumbItem[];
  backHref?: string;
  backLabel?: string;
  actionSlot?: ReactNode;
}) {
  return (
    <>
      {backHref && backLabel ? (
        <Link
          href={backHref}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-1 py-2 text-sm font-semibold transition",
            darkMode
              ? "text-slate-300 hover:text-white"
              : "text-slate-500 hover:text-slate-900",
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4 py-4">
        <div>
          <h1
            className={cn(
              "text-4xl font-semibold tracking-[-0.04em]",
              darkMode ? "text-white" : "text-black",
            )}
          >
            {title}
          </h1>
          {breadcrumb.length > 0 ? (
            <div
              className={cn(
                "mt-2 text-sm",
                darkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              {breadcrumb.map((item, index) => (
                <span key={`${item.label}-${index}`}>
                  {index > 0 ? <span className="px-2">|</span> : null}
                  <span className={item.active ? "text-[#1bb4a5]" : undefined}>
                    {item.label}
                  </span>
                </span>
              ))}
            </div>
          ) : null}
          <p
            className={cn(
              "mt-1 text-sm",
              darkMode ? "text-slate-300" : "text-slate-500",
            )}
          >
            {description}
          </p>
        </div>

        {actionSlot}
      </div>
    </>
  );
}
