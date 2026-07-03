"use client";

import { useState } from "react";

import { FormError } from "@/components/ui/FormError";
import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
} from "@/components/ui/Icons";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { cn } from "@/utils";

import type { CreationSharedProps } from "../types";

export function CreationAdminStep({
  register,
  errors,
  passwordValue,
}: CreationSharedProps & { passwordValue: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const checks = [
    { label: "8+ characters", passed: passwordValue.length >= 8 },
    { label: "At least one number", passed: /\d/.test(passwordValue) },
    { label: "Capital letter", passed: /[A-Z]/.test(passwordValue) },
    { label: "Special symbol", passed: /[^A-Za-z0-9]/.test(passwordValue) },
  ];
  const passedChecks = checks.filter((check) => check.passed).length;
  const strength =
    passedChecks <= 1
      ? {
          label: "Weak",
          activeSegments: 1,
          colorClass: "text-primary",
          barClass: "bg-primary",
        }
      : passedChecks <= 3
        ? {
            label: "Moderate",
            activeSegments: Math.max(2, passedChecks),
            colorClass: "text-primary",
            barClass: "bg-primary",
          }
        : {
            label: "Strong",
            activeSegments: 4,
            colorClass: "text-primary",
            barClass: "bg-primary",
          };

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-[2.1rem] font-bold tracking-[-0.06em] text-secondary">
          Create your Admin Account
        </h2>
        <p className="mt-2 text-base leading-6 text-muted-foreground">
          {
            "This account will have full permissions to manage your organization's environment."
          }
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="John"
            error={Boolean(errors.firstName)}
            {...register("firstName")}
          />
          <FormError message={errors.firstName?.message} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="surname">Surname</Label>
          <Input
            id="surname"
            placeholder="Doe"
            error={Boolean(errors.surname)}
            {...register("surname")}
          />
          <FormError message={errors.surname?.message} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="john.doe@gmail.com"
            error={Boolean(errors.email)}
            {...register("email")}
          />
          <FormError message={errors.email?.message} />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="************"
          error={Boolean(errors.password)}
          suffix={
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((value) => !value)}
              className="text-muted-foreground transition hover:text-secondary"
            >
              {showPassword ? (
                <EyeOffIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          }
          {...register("password")}
        />
        <FormError message={errors.password?.message} />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-secondary/50">
            Strength
          </span>
          <span
            className={cn(
              "text-xs font-bold uppercase tracking-[0.12em]",
              passwordValue.length === 0
                ? "text-secondary/40"
                : strength.colorClass,
            )}
          >
            {passwordValue.length === 0 ? "No password" : strength.label}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((segment) => (
            <span
              key={segment}
              className={cn(
                "h-1 rounded-full",
                passwordValue.length > 0 && segment < strength.activeSegments
                  ? strength.barClass
                  : "bg-[#d7dff0]",
              )}
            />
          ))}
        </div>
        <div className="grid gap-2 text-sm text-secondary/75 sm:grid-cols-2">
          {checks.map((check) => (
            <div key={check.label} className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-4 w-4 items-center justify-center rounded-full border",
                  check.passed
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted-foreground/40 text-muted-foreground",
                )}
              >
                {check.passed ? <CheckIcon className="h-3 w-3" /> : null}
              </span>
              <span>{check.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="************"
          error={Boolean(errors.confirmPassword)}
          suffix={
            <button
              type="button"
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="text-muted-foreground transition hover:text-secondary"
            >
              {showConfirmPassword ? (
                <EyeOffIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          }
          {...register("confirmPassword")}
        />
        <FormError message={errors.confirmPassword?.message} />
      </div>
    </div>
  );
}
