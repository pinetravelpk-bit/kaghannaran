import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { SignUpForm } from "@/components/forms/AuthForms";
import { AuthShell } from "@/components/site/AuthShell";

export const metadata = pageMeta({ title: "Create an account", description: "Create a free Kaghan Naran account to list your hotel, business or guide services.", path: "/auth/sign-up", noindex: true });

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  return (
    <AuthShell title="Create your account" sub="Free for travellers, businesses and guides.">
      <SignUpForm initialRole={role} />
      <p className="text-center text-muted">Already have an account? <Link href="/auth/sign-in" className="font-semibold text-maroon">Sign in</Link></p>
    </AuthShell>
  );
}
