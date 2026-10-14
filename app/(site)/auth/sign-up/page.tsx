import Link from "next/link";
import { SignUpForm } from "@/components/forms/AuthForms";
import { AuthShell } from "@/components/site/AuthShell";

export const metadata = { title: "Create an account" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  return (
    <AuthShell title="Create your account" sub="Free for travellers, businesses and guides.">
      <SignUpForm initialRole={role} />
      <p className="text-center text-muted">Already have an account? <Link href="/auth/sign-in" className="font-semibold text-maroon">Sign in</Link></p>
    </AuthShell>
  );
}
