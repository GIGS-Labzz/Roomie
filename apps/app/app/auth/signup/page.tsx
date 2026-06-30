import { AuthLayout } from "@repo/ui/auth-layout";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { EmailPasswordSignUp } from "@/components/auth/EmailPasswordSignUp";

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Roomie to find roommate matching vibes."
    >
      <GoogleSignInButton />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-slate-400 font-medium">or register with email</span>
        </div>
      </div>

      <EmailPasswordSignUp />

      <div className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{" "}
        <a href="/auth/signin" className="font-semibold text-brand-600 hover:text-brand-700 underline">
          Sign In
        </a>
      </div>

      <p className="mt-8 text-center text-[10px] text-slate-400 leading-relaxed">
        By continuing, you agree to Roomie&apos;s{" "}
        <a href="/terms" className="underline hover:text-slate-500">Terms</a>
        {" "}and{" "}
        <a href="/privacy" className="underline hover:text-slate-500">Privacy Policy</a>.
      </p>
    </AuthLayout>
  );
}
