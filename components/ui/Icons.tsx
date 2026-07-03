import type { IconName } from "@/types/onboarding";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  Users,
  Globe,
  type LucideIcon,
} from "lucide-react";

interface IconProps {
  name: IconName;
  className?: string;
}

const iconMap: Record<IconName, LucideIcon> = {
  building: Building2,
  grid: LayoutGrid,
  users: Users,
  shield: ShieldCheck,
  audit: FileText,
  clock: Clock3,
  sparkle: Sparkles,
  globe: Globe,
};

export function Icon({ name, className }: IconProps) {
  const LucideComponent = iconMap[name];
  return <LucideComponent className={className} aria-hidden="true" strokeWidth={1.8} />;
}

export function ChevronDownIcon({ className }: { className?: string }) {
  return <ChevronDown className={className} aria-hidden="true" strokeWidth={1.7} />;
}

export function CheckIcon({ className }: { className?: string }) {
  return <Check className={className} aria-hidden="true" strokeWidth={2} />;
}

export function EyeIcon({ className }: { className?: string }) {
  return <Eye className={className} aria-hidden="true" strokeWidth={1.7} />;
}

export function EyeOffIcon({ className }: { className?: string }) {
  return <EyeOff className={className} aria-hidden="true" strokeWidth={1.7} />;
}

export function ArrowRightIcon({ className }: { className?: string }) {
  return <ArrowRight className={className} aria-hidden="true" strokeWidth={1.8} />;
}

export function ArrowLeftIcon({ className }: { className?: string }) {
  return <ArrowLeft className={className} aria-hidden="true" strokeWidth={1.8} />;
}
