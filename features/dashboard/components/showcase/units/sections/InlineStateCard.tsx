"use client";

import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";

export function InlineStateCard({
  darkMode,
  title,
  body,
}: {
  darkMode: boolean;
  title: string;
  body: string;
}) {
  return (
    <Card
      className={cn(
        "mt-6 rounded-[22px] border px-6 py-5",
        darkMode ? "border-slate-800 bg-slate-900 text-white" : "border-slate-100 bg-white",
      )}
    >
      <div className="text-base font-semibold">{title}</div>
      <div className={cn("mt-1 text-sm", darkMode ? "text-slate-300" : "text-slate-500")}>
        {body}
      </div>
    </Card>
  );
}
