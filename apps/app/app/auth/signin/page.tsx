import { AuthLayout } from "@repo/ui/auth-layout";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { EmailPasswordSignIn } from "@/components/auth/EmailPasswordSignIn";

export default function SignInPage() {
  return (
    <AuthLayout
      title="Welcome to Roomie"
      subtitle="Find your perfect student roommate."
    >
      <GoogleSignInButton />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-slate-400 font-medium">or sign in with email</span>
        </div>
      </div>

      <EmailPasswordSignIn />

      <p className="mt-6 text-center text-xs text-slate-400 leading-relaxed">
        By continuing, you agree to Roomie&apos;s{" "}
        <a href="/terms" className="underline hover:text-slate-600">Terms</a>
        {" "}and{" "}
        <a href="/privacy" className="underline hover:text-slate-600">Privacy Policy</a>.
      </p>
    </AuthLayout>
  );
}
