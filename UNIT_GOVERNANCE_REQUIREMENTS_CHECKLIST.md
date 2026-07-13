# Unit Governance Requirements Checklist

Use this checklist to close the gap between the current Unit experience, the ASFS document, and the missing product requirements that should be explicitly defined.

## Product Rules

- [ ] Define the Unit screen model clearly:
  `Units overview`, `Units list`, `View Unit detail`, and `Unit dashboard` should each have a distinct purpose.
- [ ] Define the canonical Unit lifecycle states:
  `Active`, `Restricted`, `Pending Archive`, `Archived`.
- [ ] Define what triggers each Unit lifecycle state.
- [ ] Define which actions are allowed in each Unit lifecycle state.
- [ ] Define whether hard delete exists at all or whether archive is the only terminal action.
- [ ] Define restore behavior for archived or restricted units.
- [ ] Define whether archived units immediately free subscription capacity.
- [ ] Define the exact Unit metadata model:
  required fields, optional fields, short code, description, location, external IDs.
- [ ] Define whether every unit must always have at least one assigned Unit Admin.
- [ ] Define whether one assigned admin must be designated as primary.
- [ ] Define whether a “Lead Unit Admin” role exists in the product model or should be removed.

## Permissions And Scope

- [ ] Define exactly who can create a unit.
- [ ] Define exactly who can edit a unit.
- [ ] Define exactly who can archive a unit.
- [ ] Define exactly who can restore a unit.
- [ ] Define exactly who can assign Unit Admins.
- [ ] Define exactly who can remove Unit Admins.
- [ ] Define exactly who can transfer users between units.
- [ ] Define exactly who can switch unit scope in the UI.
- [ ] Define whether only Super Admin can switch between units.
- [ ] Define what Unit Admins can see on shared tables, admin lists, reports, and logs.
- [ ] Define whether blocked cross-unit actions are hidden, disabled, or shown with an explanatory message.
- [ ] Define the user-facing message for blocked cross-unit access attempts.

## UX Flows

- [ ] Define the first-run Unit experience when no units exist.
- [ ] Define the empty state when a unit has no audiences.
- [ ] Define the empty state when a unit has no assigned admins.
- [ ] Define the empty state when a unit has no users.
- [ ] Define the UX when plan limit is reached.
- [ ] Define the UX when a unit is restricted.
- [ ] Define the UX when a unit is archived.
- [ ] Define the archive confirmation flow and required warnings.
- [ ] Define the restore flow and required warnings.
- [ ] Define the Unit creation flow step-by-step.
- [ ] Define the Unit edit flow step-by-step.
- [ ] Define the Unit admin reassignment flow step-by-step.
- [ ] Define the user transfer flow between units step-by-step.
- [ ] Define the “View Unit” detail content order:
  summary, alerts, admins, audiences, users, reports, audit.
- [ ] Define the “Unit dashboard” content separately from the “View Unit” record screen.

## Search, Filters, And Views

- [ ] Define required search behavior on Units list.
- [ ] Define required filters on Units list:
  status, admin, health, activity, type.
- [ ] Define required filters on Unit detail tables:
  admins, audiences, users, alerts.
- [ ] Define whether filters should be persisted per user.
- [ ] Define whether saved views are needed for Unit management.
- [ ] Define default sort order for Units list.
- [ ] Define default sort order for assigned admin list.
- [ ] Define default sort order for audiences in a unit.

## Data And Entity Rules

- [ ] Define whether each user must belong to exactly one unit in all cases.
- [ ] Define what happens to a user’s audiences when the user is moved to another unit.
- [ ] Define what happens to historical attendance when a user changes unit.
- [ ] Define what happens to open disputes when a user changes unit.
- [ ] Define what happens to session/report scope after unit transfer.
- [ ] Define whether a unit can exist without any audience.
- [ ] Define whether an audience can be reassigned to another unit.
- [ ] Define whether a unit can be renamed after sessions and reports already exist.
- [ ] Define duplicate prevention rules for unit names, short codes, and identifiers.

## Audit And Compliance

- [ ] Define every auditable Unit event:
  create, edit, archive, restore, admin assigned, admin removed, user transferred, audience created, export generated.
- [ ] Define what metadata each Unit audit event must store:
  actor, timestamp, old value, new value, affected unit, affected user/admin, reason.
- [ ] Define which roles can view which audit logs.
- [ ] Define whether Unit Admins can view only unit-scoped logs.
- [ ] Define how export actions are logged for unit-level reports.
- [ ] Define whether blocked permission attempts are themselves audit events.

## Subscription And Limits

- [ ] Define the exact rule for maximum units by plan.
- [ ] Define whether draft units count toward plan limits.
- [ ] Define whether archived units count toward plan limits.
- [ ] Define whether restricted units count toward plan limits.
- [ ] Define which Unit features are disabled by plan.
- [ ] Define how upgrade prompts are presented when a limit is hit.
- [ ] Define whether unit creation should be blocked entirely or allowed to continue into an upgrade flow.

## Async Operations And Background Jobs

- [ ] Define whether Unit report generation is synchronous or asynchronous.
- [ ] Define whether bulk user moves between units are asynchronous.
- [ ] Define whether bulk audience reassignment is asynchronous.
- [ ] Define whether large exports use background jobs.
- [ ] Define progress, status, success, and failure states for async Unit operations.
- [ ] Define where completion notifications appear for async Unit operations.

## Bulk Operations

- [ ] Define whether bulk user import directly into a unit is supported.
- [ ] Define whether bulk user transfer between units is supported.
- [ ] Define whether bulk admin assignment is supported.
- [ ] Define whether bulk audience creation under a unit is supported.
- [ ] Define whether bulk archive or restore actions are supported.
- [ ] Define failure and partial-success behavior for bulk Unit operations.

## Recommended Immediate Decisions

- [ ] Decide whether “Lead Unit Admin” is a real supported role.
- [ ] Decide whether Unit Admin can change admin ownership inside a unit.
- [ ] Decide whether the product should have both `Unit dashboard` and `View Unit detail`.
- [ ] Decide whether unit creation without an assigned Unit Admin should be blocked or only warned.
- [ ] Decide whether archived units free plan capacity immediately.
- [ ] Decide whether Unit Admins should ever be able to switch scope outside their assigned unit.
