import { AuthLayout } from "@repo/ui/auth-layout";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function SignInPage() {
  return (
    <AuthLayout
      title="Find your roommate"
      subtitle="Sign in with Google to get started. It takes less than 60 seconds."
    >
      <GoogleSignInButton />

      <p className="mt-6 text-center text-xs text-slate-400 leading-relaxed">
        By continuing, you agree to Roomie&apos;s{" "}
        <a href="/terms" className="underline hover:text-slate-600">Terms</a>
        {" "}and{" "}
        <a href="/privacy" className="underline hover:text-slate-600">Privacy Policy</a>.
      </p>
    </AuthLayout>
  );
}
