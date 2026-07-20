"use client";

import { useRef, useState } from "react";
import { Controller } from "react-hook-form";
import type { ChangeEvent, DragEvent } from "react";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  InfoCircleIcon,
  PlusUserIcon,
  SkipForwardIcon,
  SpreadsheetIcon,
  TrashIcon,
  UploadCloudIcon,
  XCloseIcon,
} from "@/components/ui/OnboardingIcons";
import { Select } from "@/components/ui/Select";
import type { SelectOption } from "@/components/ui/Select";
import type {
  AudienceMember,
  ImportedAudienceMember,
  OnboardingFormValues,
} from "@/types/onboarding";

interface CreateAudienceStepProps {
  control: Control<OnboardingFormValues>;
  register: UseFormRegister<OnboardingFormValues>;
  errors: FieldErrors<OnboardingFormValues>;
  members: AudienceMember[];
  importedMembers: ImportedAudienceMember[];
  onOpenManual: () => void;
  onOpenImport: () => void;
  onBack: () => void;
  onSave: () => void;
  onSkipAudiencePeople: () => void;
  onRemoveMember: (id: string) => void;
  onContinue: () => void;
  isSaving?: boolean;
  isContinuing?: boolean;
  showManualModal: boolean;
  showImportModal: boolean;
  showImportReviewModal: boolean;
  manualFirstName: string;
  manualSurname: string;
  manualEmail: string;
  manualIdentifier: string;
  onManualFieldChange: (field: "manualFirstName" | "manualSurname" | "manualEmail" | "manualIdentifier", value: string) => void;
  onAddManualMember: () => void;
  onCloseManualModal: () => void;
  onSaveManualModal: () => void;
  onCloseImportModal: () => void;
  onImportFile: (file: File) => void | Promise<void>;
  onContinueImportModal: () => void;
  onCloseImportReviewModal: () => void;
  onAcceptImportReview: () => void;
  onSkipImportInvites: () => void;
  isImporting?: boolean;
  unitOptions: SelectOption[];
  audienceTypeOptions: SelectOption[];
  attendanceIdentifierOptions: SelectOption[];
  isReferenceDataLoading?: boolean;
}

export function CreateAudienceStep({
  control,
  register,
  errors,
  members,
  importedMembers,
  onOpenManual,
  onOpenImport,
  onBack,
  onSave,
  onSkipAudiencePeople,
  onRemoveMember,
  onContinue,
  isSaving,
  isContinuing,
  showManualModal,
  showImportModal,
  showImportReviewModal,
  manualFirstName,
  manualSurname,
  manualEmail,
  manualIdentifier,
  onManualFieldChange,
  onAddManualMember,
  onCloseManualModal,
  onSaveManualModal,
  onCloseImportModal,
  onImportFile,
  onContinueImportModal,
  onCloseImportReviewModal,
  onAcceptImportReview,
  onSkipImportInvites,
  isImporting,
  unitOptions,
  audienceTypeOptions,
  attendanceIdentifierOptions,
  isReferenceDataLoading,
}: CreateAudienceStepProps) {
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImportFile, setSelectedImportFile] = useState<File | null>(
    null,
  );
  const [importFileStatus, setImportFileStatus] = useState<
    "idle" | "uploading" | "completed"
  >("idle");
  const isPreparingImport = importFileStatus === "uploading";

  const formatMemberName = (member: {
    firstName: string;
    surname: string;
  }) => [member.firstName, member.surname].filter(Boolean).join(" ");

  async function prepareImportFile(file: File) {
    setSelectedImportFile(file);
    setImportFileStatus("uploading");
    try {
      await onImportFile(file);
      setImportFileStatus("completed");
    } catch {
      setSelectedImportFile(null);
      setImportFileStatus("idle");
    }
  }

  function handleImportFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    void prepareImportFile(selectedFile);
    event.target.value = "";
  }

  function handleImportDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const selectedFile = event.dataTransfer.files?.[0];

    if (!selectedFile) {
      return;
    }

    void prepareImportFile(selectedFile);
  }

  function clearSelectedImportFile() {
    setSelectedImportFile(null);
    setImportFileStatus("idle");
  }

  function formatFileSize(file: File) {
    if (file.size < 1024) {
      return `${file.size} B`;
    }

    if (file.size < 1024 * 1024) {
      return `${Math.round(file.size / 1024)} KB`;
    }

    return `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <>
      <div className="mx-auto max-w-240">
        <div className="text-center">
          <h2 className="text-[3rem] font-bold tracking-[-0.06em] text-secondary">
            Who will you track attendance for?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-6 text-secondary/75">
            Set up your first group of people. You can add members now, import a list,
            or do this later.
          </p>
        </div>

        <section className="mt-10 rounded-[0.35rem] border border-border bg-card p-8 shadow-[0_22px_50px_-38px_rgba(15,23,42,0.3)] lg:p-10">
          <div className="space-y-5">
            <div className="flex flex-col gap-1">
              <Label htmlFor="audienceGroupName">Audience group name</Label>
              <Input
                id="audienceGroupName"
                placeholder="e.g., Year 1 Computer Science Students, Lagos Branch Staff"
                error={Boolean(errors.audienceGroupName)}
                {...register("audienceGroupName")}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="audienceUnitId">Unit</Label>
                <Controller
                  name="audienceUnitId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="audienceUnitId"
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Select unit..."
                      options={unitOptions}
                    />
                  )}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="audienceType">Audience type</Label>
                <Controller
                  name="audienceType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="audienceType"
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Select type..."
                      options={audienceTypeOptions}
                      loading={isReferenceDataLoading}
                    />
                  )}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="audienceIdentifier">Unique identifier</Label>
                <Controller
                  name="audienceIdentifier"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="audienceIdentifier"
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Select identifier..."
                      options={attendanceIdentifierOptions}
                      loading={isReferenceDataLoading}
                    />
                  )}
                />
              </div>
            </div>

            <p className="text-base italic text-secondary/78">
              SynkUp uses this identifier to recognize each person during attendance.
            </p>

            {members.length > 0 ? (
              <>
                <div className="border-t border-border/80 pt-7">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold tracking-[-0.04em] text-secondary">
                      Current Members
                    </h3>
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                      {members.length} Members
                    </div>
                  </div>
                  <div className="mt-5 max-h-72 space-y-3 overflow-y-auto pr-1">
                    {members.map((member) => (
                      <div key={member.id}>
                        <div className="rounded-[0.35rem] bg-[#edf4ff] px-4 py-4 sm:hidden">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-xs font-bold uppercase tracking-[0.14em] text-secondary/60">
                                Name
                              </div>
                              <div className="mt-1 text-base font-semibold text-secondary">
                                {formatMemberName(member)}
                              </div>
                            </div>
                            <button type="button" className="shrink-0 text-secondary/60" onClick={() => onRemoveMember(member.id)}>
                              <XCloseIcon className="h-6 w-6" />
                            </button>
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="min-w-0">
                              <div className="text-xs font-bold uppercase tracking-[0.14em] text-secondary/60">
                                Identifier
                              </div>
                              <div className="mt-1 truncate text-sm font-medium text-secondary">
                                {member.identifier}
                              </div>
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold uppercase tracking-[0.14em] text-secondary/60">
                                Status
                              </div>
                              <div className="mt-2 inline-flex whitespace-nowrap rounded-full bg-white px-2 py-1 text-sm font-semibold text-primary">
                                {member.status}
                              </div>
                            </div>
                          </div>
                          <button type="button" className="mt-4 text-sm font-bold text-primary">
                            Send Invite
                          </button>
                        </div>
                        <div
                          className="hidden sm:grid sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.95fr)_auto_auto] sm:items-center sm:gap-4 sm:rounded-[0.35rem] sm:bg-[#edf4ff] sm:px-4 sm:py-4 sm:text-sm"
                        >
                          <div className="min-w-0 flex flex-col gap-1">
                            <div className="text-xs font-bold uppercase tracking-[0.14em] text-secondary/60">
                              Name
                            </div>
                            <div className="mt-1 truncate text-lg font-medium text-secondary">
                              {formatMemberName(member)}
                            </div>
                          </div>
                          <div className="min-w-0 flex flex-col gap-1">
                            <div className="text-xs font-bold uppercase tracking-[0.14em] text-secondary/60">
                              Identifier
                            </div>
                            <div className="mt-1 truncate text-lg font-medium text-secondary">
                              {member.identifier}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold uppercase tracking-[0.14em] text-secondary/60">
                              Status
                            </div>
                            <div className="mt-2 inline-flex whitespace-nowrap rounded-full bg-white px-2 py-1 text-sm font-semibold text-primary">
                              {member.status}
                            </div>
                          </div>
                          <button type="button" className="whitespace-nowrap text-lg font-bold text-primary">
                            Send Invite
                          </button>
                          <button type="button" className="text-secondary/60" onClick={() => onRemoveMember(member.id)}>
                            <XCloseIcon className="h-6 w-6" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            <div className="border-t border-border/80 pt-7">
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-secondary">
                How do you want to add people?
              </h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <ActionCard
                  title="Add manually"
                  description="Add a few people one by one"
                  icon={<PlusUserIcon className="h-8 w-8" />}
                  onClick={onOpenManual}
                />
                <ActionCard
                  title="Import spreadsheet"
                  description="Upload a list of people"
                  icon={<SpreadsheetIcon className="h-8 w-8" />}
                  onClick={onOpenImport}
                />
                <ActionCard
                  title="Skip for now"
                  description="Create the audience group and add people later"
                  icon={<SkipForwardIcon className="h-8 w-8" />}
                  onClick={onSkipAudiencePeople}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="rounded-md px-7 py-3 text-secondary"
                onClick={onBack}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-md px-7 py-3"
                onClick={onSave}
                loading={isSaving}
              >
                Save Draft
              </Button>
              <Button type="button" className="rounded-md px-7 py-3" onClick={onContinue} loading={isContinuing}>
                Save & Continue
              </Button>
            </div>
          </div>
        </section>
      </div>

      {showManualModal ? (
        <ModalCard title="Add members manually" subtitle="People who already have SynkUp accounts will be added immediately. People without accounts will receive an email invitation to join your organization." onClose={onCloseManualModal}>
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[0.35rem] border border-border/70">
              <div className="hidden sm:grid sm:grid-cols-[minmax(0,1.05fr)_minmax(0,1.35fr)_minmax(0,0.9fr)_minmax(0,1fr)_auto] sm:gap-3 sm:bg-[#fbfcfe] sm:px-4 sm:py-3 sm:text-xs sm:font-bold sm:uppercase sm:tracking-[0.14em] sm:text-secondary/60">
                <span>Name</span>
                <span>Email</span>
                <span>Identifier</span>
                <span>Status</span>
                <span />
              </div>
              <div className="max-h-43 overflow-y-auto">
                {members.map((member) => (
                  <div key={member.id} className="border-t border-border/70 px-4 py-3 first:border-t-0 sm:px-0 sm:py-0">
                    <div className="space-y-3 sm:hidden">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-secondary/60">
                            Name
                          </div>
                          <div className="mt-1 text-sm font-semibold text-secondary">
                            {formatMemberName(member)}
                          </div>
                        </div>
                        <button type="button" className="shrink-0 text-secondary/60" onClick={() => onRemoveMember(member.id)}>
                          <TrashIcon className="h-6 w-6" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="min-w-0">
                          <div className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-secondary/60">
                            Email
                          </div>
                          <div className="mt-1 break-words text-sm text-secondary/85">
                            {member.email || "No email provided"}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-secondary/60">
                            Identifier
                          </div>
                          <div className="mt-1 truncate text-sm text-secondary/85">
                            {member.identifier}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-secondary/60">
                          Status
                        </div>
                        <div className="mt-1 font-semibold text-primary">{member.status}</div>
                      </div>
                    </div>
                    <div
                      className="hidden sm:grid sm:grid-cols-[minmax(0,1.05fr)_minmax(0,1.35fr)_minmax(0,0.9fr)_minmax(0,1fr)_auto] sm:gap-3 sm:px-4 sm:py-3 sm:text-sm sm:text-secondary/85"
                    >
                      <span className="min-w-0 truncate">{formatMemberName(member)}</span>
                      <span className="min-w-0 break-words">{member.email || "No email provided"}</span>
                      <span className="min-w-0 truncate">{member.identifier}</span>
                      <span className="min-w-0 whitespace-nowrap font-semibold text-primary">{member.status}</span>
                      <button type="button" className="justify-self-end text-secondary/60" onClick={() => onRemoveMember(member.id)}>
                        <TrashIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[0.35rem] bg-[#eef4ff] p-4">
              <div className="text-sm font-bold text-secondary">Add New Person</div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="manual-member-first-name">First Name</Label>
                  <Input
                    id="manual-member-first-name"
                    placeholder="e.g., Jordan"
                    value={manualFirstName}
                    onChange={(event) =>
                      onManualFieldChange("manualFirstName", event.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="manual-member-surname">Surname</Label>
                  <Input
                    id="manual-member-surname"
                    placeholder="e.g., Smith"
                    value={manualSurname}
                    onChange={(event) =>
                      onManualFieldChange("manualSurname", event.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="manual-member-email">Email Address</Label>
                  <Input
                    id="manual-member-email"
                    placeholder="jordan@example.com"
                    value={manualEmail}
                    onChange={(event) =>
                      onManualFieldChange("manualEmail", event.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="manual-member-identifier">
                    Identifier Value
                  </Label>
                  <Input
                    id="manual-member-identifier"
                    placeholder="e.g., ST-9023"
                    value={manualIdentifier}
                    onChange={(event) =>
                      onManualFieldChange("manualIdentifier", event.target.value)
                    }
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="button" className="min-h-10 rounded-md px-4 py-2 text-xs" onClick={onAddManualMember}>
                  Add Person
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" className="rounded-md px-6 py-3" onClick={onSaveManualModal}>
                Save & Continue
              </Button>
              <Button type="button" variant="outline" className="rounded-md px-6 py-3 text-secondary" onClick={onCloseManualModal}>
                Cancel
              </Button>
            </div>
          </div>
        </ModalCard>
      ) : null}

      {showImportModal ? (
        <ModalCard title="Import audience via spreadsheet" subtitle="Upload your member list to quickly populate your audience. We'll help you map your data fields." onClose={onCloseImportModal}>
          <div className="space-y-5">
            <input
              ref={importInputRef}
              type="file"
              accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="sr-only"
              onChange={handleImportFileChange}
            />
            <div
              className="flex min-h-60 flex-col items-center justify-center rounded-[0.35rem] border border-dashed border-border bg-[#fbfdff] text-center transition hover:border-primary/45 hover:bg-[#f7fcfc]"
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleImportDrop}
            >
              <div className="flex p-4 items-center justify-center rounded-2xl bg-[#eff8fb] text-primary">
                <UploadCloudIcon className="h-10 w-10" />
              </div>
              <div className="mt-5 text-base font-medium text-secondary">
                Drag and drop your file here
              </div>
              <button
                type="button"
                className="mt-2 text-sm font-semibold text-primary"
                onClick={() => importInputRef.current?.click()}
              >
                or browse your computer
              </button>
              <div className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-secondary/60">
                Supports .CSV and .XLSX
              </div>
            </div>
            {selectedImportFile ? (
              <div className="rounded-[0.45rem] border border-border bg-white px-4 py-3 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.45)]">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.35rem] border border-[#d7ecec] bg-[#eef8f8] text-[0.65rem] font-black uppercase tracking-[-0.03em] text-primary">
                    {selectedImportFile.name.toLowerCase().endsWith(".xlsx")
                      ? "XLS"
                      : "CSV"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-secondary">
                          {selectedImportFile.name}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-secondary/58">
                          <span>{formatFileSize(selectedImportFile)}</span>
                          <span className="h-1 w-1 rounded-full bg-secondary/25" />
                          <span className="inline-flex items-center gap-1">
                            <span
                              className={
                                importFileStatus === "completed"
                                  ? "h-1.5 w-1.5 rounded-full bg-primary"
                                  : "h-1.5 w-1.5 animate-pulse rounded-full bg-[#3f6fe5]"
                              }
                            />
                            {importFileStatus === "completed"
                              ? "Completed"
                              : "Uploading..."}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="rounded-full p-1 text-secondary/50 transition hover:bg-muted hover:text-secondary"
                        onClick={clearSelectedImportFile}
                        aria-label="Remove selected import file"
                      >
                        {importFileStatus === "completed" ? (
                          <TrashIcon className="h-8 w-8" />
                        ) : (
                          <XCloseIcon className="h-8 w-8" />
                        )}
                      </button>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e3e7ee]">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{
                          width:
                            importFileStatus === "completed" ? "100%" : "58%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            <a
              href="/templates/audience-import-template.csv"
              download
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary"
            >
              <UploadCloudIcon className="h-6 w-6" />
              Download CSV Template
            </a>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                className="rounded-md px-6 py-3"
                onClick={onContinueImportModal}
                loading={isPreparingImport}
                disabled={!selectedImportFile || importFileStatus !== "completed"}
              >
                Continue
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-md px-6 py-3 text-secondary"
                onClick={onCloseImportModal}
                disabled={isPreparingImport}
              >
                Cancel
              </Button>
            </div>
          </div>
        </ModalCard>
      ) : null}

      {showImportReviewModal ? (
        <ModalCard title="Import from spreadsheet" subtitle="Upload your list of students, staff, or members to get started quickly." onClose={onCloseImportReviewModal}>
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[0.35rem] border border-border">
              <div className="hidden sm:grid sm:grid-cols-[minmax(0,1.05fr)_minmax(0,1.45fr)_minmax(0,1fr)_minmax(0,1fr)] sm:gap-3 sm:bg-[#fbfcfe] sm:px-4 sm:py-3 sm:text-[0.58rem] sm:font-bold sm:uppercase sm:tracking-[0.14em] sm:text-secondary/60">
                <span>Name</span>
                <span>Email</span>
                <span>Status</span>
                <span>Action</span>
              </div>
              <div className="h-80 overflow-y-auto">
                {importedMembers.map((member) => (
                  <div key={member.id} className="border-t border-border/70 px-4 py-3 first:border-t-0 sm:px-0 sm:py-0">
                    <div className="space-y-3 sm:hidden">
                      <div className="text-sm font-semibold text-secondary">
                        {formatMemberName(member)}
                      </div>
                      <div>
                        <div className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-secondary/60">
                          Email
                        </div>
                        <div className="mt-1 break-words text-sm text-secondary/85">
                          {member.email || "No email provided"}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-secondary/60">
                            Status
                          </div>
                          <span className="mt-1 inline-flex whitespace-nowrap rounded-full bg-[#edf4ff] px-2 py-1 text-[0.65rem] font-semibold text-primary">
                            {member.status}
                          </span>
                        </div>
                        <div>
                          <div className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-secondary/60">
                            Action
                          </div>
                          <div className="mt-1 text-sm font-semibold text-primary">
                            {member.action}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className="hidden sm:grid sm:grid-cols-[minmax(0,1.05fr)_minmax(0,1.45fr)_minmax(0,1fr)_minmax(0,1fr)] sm:gap-3 sm:px-4 sm:py-3 sm:text-xs sm:text-secondary/85"
                    >
                      <span className="min-w-0 truncate">{formatMemberName(member)}</span>
                      <span className="min-w-0 break-words">{member.email || "No email provided"}</span>
                      <span className="min-w-0">
                        <span className="inline-flex whitespace-nowrap rounded-full bg-[#edf4ff] px-2 py-1 text-[0.65rem] font-semibold text-primary">
                          {member.status}
                        </span>
                      </span>
                      <span className="min-w-0 whitespace-nowrap font-semibold text-primary">{member.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[0.35rem] bg-[#ebf8f8] px-4 py-4 text-sm text-secondary/82">
              <InfoCircleIcon className="mt-0.5 h-8 w-8 text-primary" />
              <span>
                Members without email addresses can still be added for attendance tracking,
                but they will not receive an invite until an email is added.
              </span>
            </div>
            <div className="flex flex-wrap justify-between gap-3">
              <Button type="button" variant="ghost" className="min-h-10 rounded-md px-0 py-0 text-secondary" onClick={onCloseImportReviewModal}>
                Cancel
              </Button>
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="ghost" className="min-h-10 rounded-md px-4 py-2 text-primary" onClick={onSkipImportInvites}>
                  Skip Invites for Now
                </Button>
                <Button type="button" className="rounded-md px-6 py-3" onClick={onAcceptImportReview} loading={isImporting}>
                  Add Audience & Send Invites
                </Button>
              </div>
            </div>
          </div>
        </ModalCard>
      ) : null}
    </>
  );
}

function ActionCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[0.35rem] border border-border bg-[#edf4ff] p-4 text-left transition hover:border-primary/35 hover:bg-[#e9f3ff]"
    >
      <div className="text-primary">{icon}</div>
      <div className="mt-3 text-base font-bold text-secondary">{title}</div>
      <div className="mt-1 text-sm leading-5 text-secondary/72">{description}</div>
    </button>
  );
}

function ModalCard({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-secondary/25 px-4 py-8 backdrop-blur-[2px]">
      <div className="w-full max-w-160 rounded-[0.45rem] bg-card p-6 shadow-[0_36px_100px_-40px_rgba(15,23,42,0.45)] lg:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold tracking-[-0.04em] text-secondary">{title}</h3>
            <p className="mt-2 max-w-xl text-base leading-6 text-secondary/75">{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-secondary/60 transition hover:bg-muted hover:text-secondary">
            <XCloseIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
