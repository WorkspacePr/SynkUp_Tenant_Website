"use client";

import type { ReactNode } from "react";

export type UnitWorkspaceView = "overview" | "list" | "detail";
export type UnitLifecycleStatus =
  | "ACTIVE"
  | "ARCHIVED"
  | "RESTRICTED"
  | "PENDING ARCHIVE";
export type AdminRole = "Unit Admin" | "Read-Only Admin";
export type CreateUnitStatus = "Active" | "Draft";
export type UnitType = "Campus" | "Branch" | "Department" | "Subsidiary";

export type UnitAlert = {
  title: string;
  description: string;
  state: "healthy" | "warning" | "critical";
};

export type UnitSummary = {
  id: number;
  name: string;
  shortCode?: string | null;
  status?: string;
  type?: string | null;
  description?: string | null;
  location?: string | null;
  city?: string | null;
  stateRegion?: string | null;
  country?: string | null;
  totalUsers: string;
  audiences: string;
  sessions: string;
  admins: string[];
  organization: string;
  createdAt: string;
  updatedAt?: string;
  archivedAt?: string | null;
  archiveReason?: string | null;
  statusLabel: string;
  statusMessage: string;
  lifecycleStatus: UnitLifecycleStatus;
  criticalAlertsCount: number;
  affectedUsers: number;
  affectedAudiences: number;
  activeSessionsCount: number;
  alerts: UnitAlert[];
};

export type AudienceSummary = {
  name: string;
  admin: string;
  totalUsers: string;
  status: string;
};

export type AssignedUnitAdmin = {
  id?: number;
  name: string;
  email: string;
  role: AdminRole | "Lead Unit Admin";
  status: "Active" | "Inactive" | "Pending";
  lastActive: string;
};

export type AdminCandidate = {
  id: string;
  name: string;
  email: string;
  tenant: "current" | "other";
  active: boolean;
  assignedUnitId?: number;
  maxRole: AdminRole;
};

export type UnitsWorkspaceProps = {
  darkMode: boolean;
  role: "super" | "unit" | "audience";
  view: UnitWorkspaceView;
  selectedUnitId?: number;
};

export type CreateUnitModalProps = {
  darkMode: boolean;
  open: boolean;
  onClose: () => void;
  planLimitReached?: boolean;
  existingUnitNames?: string[];
  unitTypeOptions?: Array<{ label: string; value: string }>;
  countryOptions?: Array<{ label: string; value: string }>;
  adminOptions?: Array<{ id: number; name: string; email: string }>;
  adminOptionsNote?: string;
  onCreated?: () => Promise<void> | void;
};

export type EditUnitModalProps = {
  darkMode: boolean;
  open: boolean;
  onClose: () => void;
  unit: UnitSummary;
  existingUnitNames?: string[];
  unitTypeOptions?: Array<{ label: string; value: string }>;
  countryOptions?: Array<{ label: string; value: string }>;
  adminOptions?: Array<{ id: number; name: string; email: string }>;
  adminOptionsNote?: string;
  onUpdated?: () => Promise<void> | void;
};

export type AssignAdminModalProps = {
  darkMode: boolean;
  open: boolean;
  onClose: () => void;
  unit: UnitSummary;
  assignedAdmins?: AssignedUnitAdmin[];
  adminOptions?: Array<{ id: number; name: string; email: string }>;
  adminOptionsNote?: string;
  onAssigned?: () => Promise<void> | void;
};

export type ArchiveUnitModalProps = {
  darkMode: boolean;
  open: boolean;
  onClose: () => void;
  unit: UnitSummary;
  onArchived?: () => Promise<void> | void;
};

export type MoveUsersModalProps = {
  darkMode: boolean;
  open: boolean;
  onClose: () => void;
  unit: UnitSummary;
  availableUnits?: UnitSummary[];
};

export type PaginationItem = number | "...";

export type UnitFormDefaults = {
  unitType: UnitType;
  location: string;
  description: string;
  shortCode: string;
  status: CreateUnitStatus;
  assignedAdmins: string[];
};

export type FilterOption = {
  label: string;
  value: string;
};

export type FilterSelectConfig = {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  className?: string;
};

export type FilterSegment = {
  label: string;
  value: string;
  count: number;
};

export type OverviewMetric = {
  title: string;
  value: string;
  icon: ReactNode;
  accent?: "green";
  titleClassName?: string;
  valueClassName?: string;
};
