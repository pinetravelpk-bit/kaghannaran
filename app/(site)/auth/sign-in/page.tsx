import Link from "next/link";
import { SignInForm } from "@/components/forms/AuthForms";
import { AuthShell } from "@/components/site/AuthShell";

export const metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <AuthShell title="Welcome back" sub="Sign in to manage your listings, or to moderate as staff.">
      <SignInForm next={next} />
      <p className="text-center text-muted">New here? <Link href="/auth/sign-up" className="font-semibold text-maroon">Create an account</Link></p>
    </AuthShell>
  );
}
