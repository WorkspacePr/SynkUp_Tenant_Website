import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { Label } from "@/components/ui/Label";
import { cn } from "@/utils";

interface OrganizationStageProps {
  subdomain: string;
  error: string;
  isSubmitting: boolean;
  onSubdomainChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function OrganizationStage({
  subdomain,
  error,
  isSubmitting,
  onSubdomainChange,
  onSubmit,
}: OrganizationStageProps) {
  return (
    <form className="space-y-8" onSubmit={onSubmit}>
      <div className="space-y-2">
        <h2 className="text-[2.1rem] font-bold tracking-[-0.06em] text-secondary">
          Sign in to your organization
        </h2>
        <p className="max-w-sm text-base leading-6 text-muted-foreground">
          Enter your organization&apos;s subdomain to access your secure portal.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="organization-subdomain">Organisation Subdomain</Label>
        <div
          className={cn(
            "flex h-13 items-center overflow-hidden rounded-[1.1rem] border bg-card shadow-[0_12px_26px_-24px_rgba(15,23,42,0.7)] transition",
            error ? "border-destructive" : "border-border",
          )}
        >
          <input
            id="organization-subdomain"
            value={subdomain}
            onChange={(event) => onSubdomainChange(event.target.value)}
            placeholder="yourorg"
            className="h-full flex-1 bg-transparent px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <span className="mr-2 rounded-[0.9rem] bg-[#edf3f3] px-3 py-2 text-xs text-secondary/75">
            .synkup.app
          </span>
        </div>
        <FormError
          message={error}
          className="flex items-start gap-2 text-[0.72rem] leading-5"
        />
      </div>

      <Button
        className="w-full"
        type="submit"
        disabled={isSubmitting}
        loading={isSubmitting}
      >
        <span>Find Organisation</span>
        <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
      </Button>

      <p className="text-center text-sm text-secondary/70">
        Don&apos;t know your subdomain?{" "}
        <a
          className="font-medium text-primary underline-offset-4 hover:underline"
          href="#"
        >
          Contact Support
        </a>
      </p>
    </form>
  );
}
