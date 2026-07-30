import { AccountSetupForm } from "@/features/auth/components/account-setup/AccountSetupForm";

type AccountSetupPageProps = {
  params: Promise<{ token: string }>;
};

export default async function AccountSetupPage({ params }: AccountSetupPageProps) {
  const { token } = await params;

  return <AccountSetupForm token={token} />;
}
