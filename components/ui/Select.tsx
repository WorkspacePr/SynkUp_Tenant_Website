"use client";

import * as React from "react";

import { CheckIcon, ChevronDownIcon } from "@/components/ui/Icons";
import { cn } from "@/utils";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps {
  id?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  options: SelectOption[];
  loading?: boolean;
  error?: boolean;
  disabled?: boolean;
  darkMode?: boolean;
  variant?: "default" | "compact";
  align?: "start" | "end";
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  emptyMessage?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

function firstEnabledIndex(options: SelectOption[]) {
  return options.findIndex((option) => !option.disabled);
}

function nextEnabledIndex(options: SelectOption[], current: number, direction: 1 | -1) {
  if (!options.length) return -1;
  for (let step = 1; step <= options.length; step += 1) {
    const index = (current + direction * step + options.length) % options.length;
    if (!options[index]?.disabled) return index;
  }
  return -1;
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
      darkMode,
      variant = "default",
      align = "start",
      className,
      buttonClassName,
      menuClassName,
      emptyMessage = "No options available",
      onChange,
      onBlur,
      ...ariaProps
    },
    forwardedRef,
  ) => {
    const [open, setOpen] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState(-1);
    const generatedId = React.useId();
    const buttonId = id ?? `select-${generatedId}`;
    const listboxId = `${buttonId}-listbox`;
    const containerRef = React.useRef<HTMLDivElement>(null);
    const buttonRef = React.useRef<HTMLButtonElement | null>(null);
    const optionRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
    const selectedIndex = options.findIndex((option) => option.value === value);
    const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;
    const isOpen = open && !loading && !disabled;

    React.useImperativeHandle(forwardedRef, () => buttonRef.current as HTMLButtonElement);

    React.useEffect(() => {
      function handlePointerDown(event: MouseEvent) {
        if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
      }

      document.addEventListener("mousedown", handlePointerDown);
      return () => document.removeEventListener("mousedown", handlePointerDown);
    }, []);

    React.useEffect(() => {
      if (!isOpen || activeIndex < 0) return;
      optionRefs.current[activeIndex]?.focus();
    }, [activeIndex, isOpen]);

    function openMenu(preferredIndex = selectedIndex) {
      const nextIndex = preferredIndex >= 0 && !options[preferredIndex]?.disabled
        ? preferredIndex
        : firstEnabledIndex(options);
      setActiveIndex(nextIndex);
      setOpen(true);
    }

    function closeMenu({ restoreFocus = false, blur = false } = {}) {
      setOpen(false);
      if (blur) onBlur?.();
      if (restoreFocus) window.requestAnimationFrame(() => buttonRef.current?.focus());
    }

    function handleSelect(nextValue: string, optionDisabled?: boolean) {
      if (optionDisabled) return;
      onChange?.(nextValue);
      closeMenu({ restoreFocus: true, blur: true });
    }

    function handleButtonKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
      if (disabled || loading) return;
      if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].includes(event.key)) return;
      event.preventDefault();
      if (event.key === "End") {
        const reversedIndex = [...options].reverse().findIndex((option) => !option.disabled);
        openMenu(reversedIndex < 0 ? -1 : options.length - 1 - reversedIndex);
      } else if (event.key === "ArrowUp") {
        const start = selectedIndex >= 0 ? selectedIndex : 0;
        openMenu(nextEnabledIndex(options, start, -1));
      } else {
        openMenu(event.key === "Home" ? firstEnabledIndex(options) : selectedIndex);
      }
    }

    function handleOptionKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu({ restoreFocus: true });
        return;
      }
      if (event.key === "Tab") {
        closeMenu({ blur: true });
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleSelect(options[index].value, options[index].disabled);
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      if (event.key === "Home") setActiveIndex(firstEnabledIndex(options));
      else if (event.key === "End") {
        const reversedIndex = [...options].reverse().findIndex((option) => !option.disabled);
        setActiveIndex(reversedIndex < 0 ? -1 : options.length - 1 - reversedIndex);
      } else setActiveIndex(nextEnabledIndex(options, index, event.key === "ArrowDown" ? 1 : -1));
    }

    return (
      <div ref={containerRef} className={cn("relative", className)}>
        {name ? <input type="hidden" name={name} value={value} /> : null}
        <button
          ref={buttonRef}
          id={buttonId}
          type="button"
          disabled={disabled || loading}
          onClick={() => (isOpen ? closeMenu() : openMenu())}
          onKeyDown={handleButtonKeyDown}
          onBlur={(event) => {
            const relatedTarget = event.relatedTarget as Node | null;
            if (!containerRef.current?.contains(relatedTarget)) closeMenu({ blur: true });
          }}
          className={cn(
            "flex w-full items-center justify-between gap-2 border text-left transition focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60",
            variant === "compact"
              ? "min-h-10 rounded-xl px-3 py-2 text-sm font-semibold shadow-sm"
              : "min-h-14 rounded-[1.15rem] bg-card px-4 py-4 shadow-[0_12px_26px_-24px_rgba(15,23,42,0.7)]",
            darkMode === true && "border-slate-700 bg-slate-900 text-white",
            darkMode === false && variant === "compact" && "border-slate-200 bg-white text-slate-700",
            darkMode === undefined && (error ? "border-destructive" : "border-border"),
            error && "border-destructive",
            buttonClassName,
          )}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-expanded={isOpen}
          aria-activedescendant={isOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
          {...ariaProps}
        >
          <span className={cn("truncate", variant === "default" && "text-sm", selected ? "text-inherit" : "text-muted-foreground")}>
            {selected?.label ?? (loading ? "Loading..." : placeholder)}
          </span>
          {loading ? (
            <span aria-hidden="true" className="ml-3 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent text-primary" />
          ) : (
            <ChevronDownIcon className={cn("ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
          )}
        </button>

        {isOpen ? (
          <div
            id={listboxId}
            className={cn(
              "scrollbar-dashboard absolute z-50 mt-2 max-h-64 min-w-full overflow-y-auto rounded-2xl border p-2 shadow-[0_24px_48px_-28px_rgba(15,23,42,0.42)]",
              align === "end" ? "right-0" : "left-0",
              darkMode === true ? "border-slate-700 bg-slate-900" : "border-border bg-card",
              menuClassName,
            )}
            role="listbox"
            aria-labelledby={buttonId}
          >
            {options.length === 0 ? (
              <div className="flex min-h-24 items-center justify-center rounded-xl px-3 py-6 text-sm text-muted-foreground">{emptyMessage}</div>
            ) : options.map((option, index) => {
              const isSelected = option.value === value;
              return (
                <button
                  ref={(node) => { optionRefs.current[index] = node; }}
                  id={`${listboxId}-option-${index}`}
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  tabIndex={index === activeIndex ? 0 : -1}
                  onMouseEnter={() => { if (!option.disabled) setActiveIndex(index); }}
                  onKeyDown={(event) => handleOptionKeyDown(event, index)}
                  onClick={() => handleSelect(option.value, option.disabled)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
                    option.disabled
                      ? "cursor-not-allowed text-muted-foreground/50"
                      : darkMode
                        ? "text-slate-200 hover:bg-slate-800 focus:bg-slate-800"
                        : "text-slate-700 hover:bg-slate-50 focus:bg-slate-50",
                    isSelected && (darkMode ? "bg-[#113c39] text-[#67d6cf]" : "bg-[#edf9f8] text-[#16a394]"),
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected ? <CheckIcon className="h-4 w-4 shrink-0 text-primary" /> : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  },
);

Select.displayName = "Select";
