import type { SignInStage, StoryContent } from "./types";

export const SIGN_IN_STORY_CONTENT: Record<SignInStage, StoryContent> = {
  organization: {
    title: "Welcome to your \n workspace.",
    description:
      "Experience technical precision and uncompromising security. Log in to your organization's dedicated environment.",
    footer: "Enterprise Grade Encryption",
  },
  credentials: {
    title: "Secure Access.",
    description:
      "Enterprise-grade authentication powered by SynkUp's architectural precision. Protecting your organization's core data with zero-trust protocols.",
    footer: "Logical Architect Security Layer v4.2",
  },
  verify: {
    title: "Verify Your Identity",
    description:
      "To maintain a 'Logical Architect' standard of data integrity, we require a multi-factor authentication for administrative access. This ensures that your organization's hierarchy and sensitive configurations remain protected under top-tier encryption standards.",
    footer: "Logical Architect Security Layer v4.2",
  },
};
