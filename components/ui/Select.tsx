import * as React from "react";

import { CheckIcon, ChevronDownIcon } from "@/components/ui/Icons";
import { cn } from "@/utils";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectProps {
  id?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  options: SelectOption[];
  loading?: boolean;
  error?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      id,
      name,
      value = "",
      placeholder = "Select an option",
      options,
      loading = false,
      error,
      disabled,
      onChange,
      onBlur,
      ...ariaProps
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const selected = options.find((option) => option.value === value);

    React.useEffect(() => {
      function handlePointerDown(event: MouseEvent) {
        if (!containerRef.current?.contains(event.target as Node)) {
          setOpen(false);
        }
      }

      document.addEventListener("mousedown", handlePointerDown);
      return () => document.removeEventListener("mousedown", handlePointerDown);
    }, []);

    function handleSelect(nextValue: string, optionDisabled?: boolean) {
      if (optionDisabled) return;
      onChange?.(nextValue);
      setOpen(false);
      onBlur?.();
    }

    React.useEffect(() => {
      if (loading) {
        setOpen(false);
      }
    }, [loading]);

    return (
      <div ref={containerRef} className="relative">
        {name ? <input type="hidden" name={name} value={value} /> : null}
        <button
          ref={ref}
          id={id}
          type="button"
          disabled={disabled || loading}
          onClick={() => {
            if (!loading) {
              setOpen((current) => !current);
            }
          }}
          onBlur={(event) => {
            const relatedTarget = event.relatedTarget as Node | null;
            if (!containerRef.current?.contains(relatedTarget)) {
              setOpen(false);
              onBlur?.();
            }
          }}
          className={cn(
            "flex min-h-14 w-full items-center justify-between rounded-[1.15rem] border bg-card px-4 py-4 text-left shadow-[0_12px_26px_-24px_rgba(15,23,42,0.7)] transition focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60",
            error ? "border-destructive" : "border-border",
          )}
          aria-haspopup="listbox"
          aria-expanded={open}
          {...ariaProps}
        >
          <span
            className={cn(
              "truncate text-sm",
              selected ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {selected?.label ?? (loading ? "Loading..." : placeholder)}
          </span>
          {loading ? (
            <span className="ml-3 inline-flex shrink-0 items-center gap-2 text-primary">
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              />
            </span>
          ) : (
            <ChevronDownIcon
              className={cn(
                "ml-3 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
            />
          )}
        </button>

        {open ? (
          <div
            className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-[1.15rem] border border-border bg-card p-2 shadow-[0_24px_48px_-28px_rgba(15,23,42,0.42)]"
            role="listbox"
            aria-labelledby={id}
          >
            {loading ? (
              <div className="flex h-full min-h-24 flex-col items-center justify-center gap-3 rounded-xl px-3 py-6 text-sm text-muted-foreground">
                <span
                  aria-hidden="true"
                  className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
                />
                <span>Loading options...</span>
              </div>
            ) : null}
            {!loading && options.length === 0 ? (
              <div className="flex h-full min-h-24 items-center justify-center rounded-xl px-3 py-6 text-sm text-muted-foreground">
                No options available
              </div>
            ) : null}
            {!loading
              ? options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onClick={() => handleSelect(option.value, option.disabled)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition",
                    option.disabled
                      ? "cursor-not-allowed text-muted-foreground/50"
                      : "text-secondary hover:bg-muted",
                    isSelected && "bg-primary/8 text-primary",
                  )}
                >
                  <span>{option.label}</span>
                  {isSelected ? <CheckIcon className="h-4 w-4 text-primary" /> : null}
                </button>
              );
              })
              : null}
          </div>
        ) : null}
      </div>
    );
  },
);

Select.displayName = "Select";
