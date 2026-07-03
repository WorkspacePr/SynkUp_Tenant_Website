import type { PlanId } from "@/types/onboarding";

export const planDetails: Record<
  PlanId,
  {
    name: string;
    monthlyPrice: number;
    summary: string;
    features: string[];
  }
> = {
  basic: {
    name: "Basic",
    monthlyPrice: 10000,
    summary: "Essential tools for small agile teams looking to organize.",
    features: [
      "Up to 5 Units",
      "Up to 500 users",
      "Unlimited audiences",
      "QR attendance",
      "Manual & batch user creation",
      "Attendance history",
      "Basic reports",
    ],
  },
  pro: {
    name: "Pro",
    monthlyPrice: 30000,
    summary: "Advanced collaboration features for scaling organizations.",
    features: [
      "Up to 5 Units",
      "Up to 3,000 users",
      "Unlimited audiences",
      "Offline attendance & sync",
      "Geofencing",
      "Notifications",
      "Advanced reports (CSV/PDF)",
      "Priority support",
      "And Everything Available on Basic",
    ],
  },
  enterprise: {
    name: "Enterprise",
    monthlyPrice: 75000,
    summary: "Maximum control and security for global enterprises.",
    features: [
      "Unlimited units",
      "Unlimited users",
      "Custom roles & permissions",
      "API access",
      "SLA-backed support",
      "Dedicated onboarding",
      "Custom integrations",
      "And Everything Available on Pro",
    ],
  },
};
