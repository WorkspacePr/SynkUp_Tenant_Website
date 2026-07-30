export type SignInStage =
  | "organization"
  | "credentials"
  | "verify"
  | "password-expired";

export interface StoryContent {
  title: string;
  description: string;
  footer: string;
}
