"use client";

import type { ReactNode } from "react";

export type RoleKey = "super" | "unit" | "audience";
export type Tone = "success" | "warning" | "danger" | "info";

export type NavItem = {
  label: string;
  icon: ReactNode;
  active?: boolean;
  href?: string;
  children?: string[];
};

export type MetricCardData = {
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendTone?: Tone | "neutral";
  accent?: "green" | "plain";
  icon: ReactNode;
};

export type ToastData = {
  title: string;
  description: string;
  tone: Tone;
};

export type SessionRow = {
  title: string;
  meta: string;
  time: string;
  stat: string;
  badge: string;
  badgeTone: "live" | "upcoming" | "archived" | "completed" | "locked";
  actionLabel?: string;
};

export type ListItem = {
  title: string;
  subtitle: string;
  meta?: string;
  status?: string;
  statusTone?: Tone | "neutral";
  actionLabel?: string;
};

export type DownloadItem = {
  title: string;
  meta: string;
  expiry: string;
};

export type SelectOption = {
  label: string;
  value: string;
};

export type ShowcaseCard = {
  title: string;
  description: string;
  tone: Tone | "neutral";
  bullets?: string[];
};

export type ProvisioningStat = {
  label: string;
  value: string;
  helper: string;
  tone?: Tone | "neutral";
};

export type ProvisioningPanel = {
  title: string;
  subtitle: string;
  stats: ProvisioningStat[];
  importHealth: ListItem[];
  pendingInvites: ListItem[];
  duplicateQueue: ListItem[];
  primaryAction: string;
  secondaryAction: string;
};

export type DisputeSlaStat = {
  label: string;
  value: string;
  helper: string;
  tone?: Tone | "neutral";
};

export type DisputeSlaItem = {
  title: string;
  subtitle: string;
  age: string;
  countdown: string;
  automation: string;
  status: string;
  statusTone?: Tone | "neutral";
};

export type DisputeSlaPanel = {
  title: string;
  subtitle: string;
  stats: DisputeSlaStat[];
  items: DisputeSlaItem[];
  automationSummary: string;
  primaryAction: string;
  secondaryAction: string;
};

export type SystemHealthStat = {
  label: string;
  value: string;
  helper: string;
  tone?: Tone | "neutral";
};

export type SystemHealthItem = {
  title: string;
  subtitle: string;
  detail: string;
  status: string;
  statusTone?: Tone | "neutral";
};

export type SystemHealthPanel = {
  title: string;
  subtitle: string;
  stats: SystemHealthStat[];
  serviceStatus: SystemHealthItem[];
  outageHistory: SystemHealthItem[];
  maintenanceNotices: SystemHealthItem[];
  accessSummary: string;
  primaryAction: string;
  secondaryAction: string;
};

export type ActionQueueStat = {
  label: string;
  value: string;
  helper: string;
  tone?: Tone | "neutral";
};

export type ActionQueueItem = {
  title: string;
  subtitle: string;
  detail: string;
  status: string;
  statusTone?: Tone | "neutral";
};

export type ActionQueuePanel = {
  title: string;
  subtitle: string;
  stats: ActionQueueStat[];
  approvals: ActionQueueItem[];
  followUps: ActionQueueItem[];
  timeSensitive: ActionQueueItem[];
  primaryAction: string;
  secondaryAction: string;
};

export type CommandBarItem = {
  title: string;
  subtitle: string;
  meta: string;
  keyword: string;
  status?: string;
  statusTone?: Tone | "neutral";
};

export type CommandBarGroup = {
  title:
    | "Users"
    | "Sessions"
    | "Audiences"
    | "Units"
    | "Tickets"
    | "Disputes"
    | "Exports";
  items: CommandBarItem[];
};

export type CommandBarConfig = {
  placeholder: string;
  emptyState: string;
  recentSearches: string[];
  groups: CommandBarGroup[];
};

export type QuickActionItem = {
  title: string;
  description: string;
  tone?: Tone | "neutral";
};

export type QuickActionsPanel = {
  title: string;
  subtitle: string;
  actions: QuickActionItem[];
};

export type SavedViewItem = {
  title: string;
  subtitle: string;
  detail: string;
  status?: string;
  statusTone?: Tone | "neutral";
};

export type SavedViewsPanel = {
  title: string;
  subtitle: string;
  views: SavedViewItem[];
};

export type GuidedEmptyStateItem = {
  title: string;
  description: string;
  actionLabel: string;
  tone?: Tone | "neutral";
};

export type GuidedEmptyStatesPanel = {
  title: string;
  subtitle: string;
  items: GuidedEmptyStateItem[];
};

export type SessionIntegrityStat = {
  label: string;
  value: string;
  helper: string;
  tone?: Tone | "neutral";
};

export type SessionIntegrityItem = {
  title: string;
  subtitle: string;
  detail: string;
  status: string;
  statusTone?: Tone | "neutral";
};

export type SessionIntegrityPanel = {
  title: string;
  subtitle: string;
  stats: SessionIntegrityStat[];
  conflicts: SessionIntegrityItem[];
  governance: SessionIntegrityItem[];
  reviews: SessionIntegrityItem[];
  primaryAction: string;
  secondaryAction: string;
};

export type RoleConfig = {
  roleLabel: string;
  pageTitle: string;
  pageSubtitle: string;
  scopeText?: string;
  scopeOptions?: string[];
  audienceTabs?: string[];
  navMain: NavItem[];
  navBottom: NavItem[];
  toasts: ToastData[];
  metrics: MetricCardData[];
  trendTitle: string;
  trendSubtitle: string;
  performanceTitle: string;
  performanceSubtitle: string;
  performanceBars: Array<{ label: string; value: number }>;
  sessionCardTitle: string;
  sessionCardSubtitle: string;
  sessionAction: string;
  sessions: SessionRow[];
  lowerLeftTitle: string;
  lowerLeftSubtitle: string;
  lowerLeftItems: ListItem[];
  lowerLeftFooter: string;
  lowerRightTitle: string;
  lowerRightSubtitle: string;
  lowerRightItems: ListItem[];
  lowerRightFooter?: string;
  extraBottomLeftTitle?: string;
  extraBottomLeftSubtitle?: string;
  extraBottomLeftItems?: ListItem[];
  extraBottomLeftFooter?: string;
  extraBottomRightTitle?: string;
  extraBottomRightSubtitle?: string;
  extraBottomRightItems?: ListItem[];
  extraBottomRightFooter?: string;
  stateShowcaseTitle?: string;
  stateShowcaseItems?: ShowcaseCard[];
  modalExamplesTitle?: string;
  modalExamples?: ShowcaseCard[];
  provisioningPanel?: ProvisioningPanel;
  disputeSlaPanel?: DisputeSlaPanel;
  systemHealthPanel?: SystemHealthPanel;
  actionQueuePanel?: ActionQueuePanel;
  commandBar?: CommandBarConfig;
  quickActionsPanel?: QuickActionsPanel;
  savedViewsPanel?: SavedViewsPanel;
  guidedEmptyStatesPanel?: GuidedEmptyStatesPanel;
  sessionIntegrityPanel?: SessionIntegrityPanel;
  audienceLivePanel?: {
    title: string;
    timer: string;
    progress: number;
    summary: string;
    primaryAction: string;
    secondaryAction: string;
  };
  reportFilters?: {
    dateRange: string;
    session: string;
    audience: string;
    downloads: DownloadItem[];
  };
};
