import { z } from "zod";

export const tenantOnboardingSchema = z.object({
  organisationName: z.string().min(2, "Organisation name is required."),
  organisationType: z.string().min(1, "Organisation type is required."),
  industrySector: z.string().min(1, "Industry sector is required."),
  subdomain: z
    .string()
    .min(3, "Preferred subdomain is required.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only."),
  firstName: z.string().min(1, "First name is required."),
  surname: z.string().min(1, "Surname is required."),
  fullName: z.string().min(2, "Full name is required."),
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .refine((value) => /[A-Z]/.test(value), {
      message: "Password must include a capital letter.",
    })
    .refine((value) => /\d/.test(value), {
      message: "Password must include a number.",
    }),
  confirmPassword: z.string().min(1, "Please confirm your password."),
  verificationCode: z
    .string()
    .refine((value) => value === "" || /^\d{6}$/.test(value), {
      message: "Verification code must be 6 digits.",
    }),
  planId: z.union([z.literal(""), z.enum(["basic", "pro", "enterprise"])]),
  organizationDisplayName: z.string().min(2, "Organization display name is required."),
  organizationType: z.string().min(1, "Organization type is required."),
  organizationLogoName: z.string(),
  defaultAttendanceIdentifier: z
    .string()
    .min(1, "Default attendance identifier is required."),
  unitName: z.string().min(2, "Unit name is required."),
  unitType: z.string().min(1, "Unit type is required."),
  unitTypeOther: z.string(),
  unitDescription: z.string(),
  inviteEmail: z
    .string()
    .trim()
    .refine((value) => value === "" || z.email().safeParse(value).success, {
      message: "Enter a valid email address.",
    }),
  inviteRole: z.string(),
  inviteUnitId: z.string(),
  inviteAudienceId: z.string(),
  audienceGroupName: z.string().min(2, "Audience group name is required."),
  audienceType: z.string().min(1, "Audience type is required."),
  audienceUnitId: z.string().min(1, "Unit is required."),
  audienceIdentifier: z.string().min(1, "Unique identifier is required."),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match.",
}).refine((data) => data.unitType !== "other" || data.unitTypeOther.trim().length > 0, {
  path: ["unitTypeOther"],
  message: "Please specify the unit type.",
});
