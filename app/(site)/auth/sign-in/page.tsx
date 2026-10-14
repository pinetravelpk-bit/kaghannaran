import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { SignInForm } from "@/components/forms/AuthForms";
import { AuthShell } from "@/components/site/AuthShell";

export const metadata = pageMeta({ title: "Sign in", description: "Sign in to manage your Kaghan Naran listings.", path: "/auth/sign-in", noindex: true });

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <AuthShell title="Welcome back" sub="Sign in to manage your listings, or to moderate as staff.">
      <SignInForm next={next} />
      <p className="text-center text-muted">New here? <Link href="/auth/sign-up" className="font-semibold text-maroon">Create an account</Link></p>
    </AuthShell>
  );
}
