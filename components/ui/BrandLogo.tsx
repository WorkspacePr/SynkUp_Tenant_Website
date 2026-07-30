import Image from "next/image";

import { cn } from "@/utils";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  labelClassName?: string;
  imageContainerClassName?: string;
  showLabel?: boolean;
  priority?: boolean;
};

export function BrandLogo({
  className,
  imageClassName,
  imageContainerClassName,
  labelClassName,
  showLabel = true,
  priority = false,
}: BrandLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <div className={cn(imageContainerClassName)}>
        <Image
          src="/images/brand/synkup-logo.png"
          alt="SynkUp"
          width={200}
          height={200}
          priority={priority}
          className={cn("h-9 w-9 shrink-0 object-contain", imageClassName)}
        />
      </div>
      {showLabel ? (
        <span
          className={cn(
            "text-xl font-extrabold tracking-[-0.04em]",
            labelClassName,
          )}
        >
          SynkUp
        </span>
      ) : null}
    </div>
  );
}
