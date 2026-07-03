import { cn } from "@/utils";

interface IconProps {
  className?: string;
}

export function SynkUpMarkIcon({ className }: IconProps) {
  return (
    <svg className={cn(className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6h12M6 12h8M6 18h10"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BellIcon({ className }: IconProps) {
  return (
    <svg className={cn(className)} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 3.5a3 3 0 0 0-3 3v1.2c0 .8-.2 1.6-.6 2.3L5.5 12h9l-.9-2c-.4-.7-.6-1.5-.6-2.3V6.5a3 3 0 0 0-3-3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8.5 14.5a1.7 1.7 0 0 0 3 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function CircleHelpIcon({ className }: IconProps) {
  return (
    <svg className={cn(className)} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.8 7.6a1.6 1.6 0 1 1 2.4 1.4c-.7.4-1.2.8-1.2 1.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="10" cy="13.5" r=".8" fill="currentColor" />
    </svg>
  );
}

export function SparklesBoltIcon({ className }: IconProps) {
  return (
    <svg className={cn(className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m13 2-5 9h4l-1 11 5-9h-4l1-11Z" fill="currentColor" />
    </svg>
  );
}

export function PlusUserIcon({ className }: IconProps) {
  return (
    <svg className={cn(className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 18a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 8v6M15 11h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function UploadCloudIcon({ className }: IconProps) {
  return (
    <svg className={cn(className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 18H7a4 4 0 1 1 .8-7.9A5.5 5.5 0 0 1 18 8.5 3.5 3.5 0 1 1 18.5 18H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 12v8M8.8 15.2 12 12l3.2 3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SpreadsheetIcon({ className }: IconProps) {
  return (
    <svg className={cn(className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 3h8l4 4v14H6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14 3v5h5M9 11h6M9 15h6M9 19h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function SkipForwardIcon({ className }: IconProps) {
  return (
    <svg className={cn(className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 7 7 5-7 5V7Zm8 0 7 5-7 5V7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <svg className={cn(className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="2" fill="currentColor" />
    </svg>
  );
}

export function CameraIcon({ className }: IconProps) {
  return (
    <svg className={cn(className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8h3l1.5-2h7L17 8h3v10H4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function XCloseIcon({ className }: IconProps) {
  return (
    <svg className={cn(className)} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg className={cn(className)} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5.5 6.5h9M8 6.5V5h4v1.5M7 8.5V14m3-5.5V14m3-5.5V14M6 6.5 6.5 15h7L14 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function InfoCircleIcon({ className }: IconProps) {
  return (
    <svg className={cn(className)} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10 9v4M10 6.8h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
