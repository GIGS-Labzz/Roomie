import { AuthLayout } from "@repo/ui/auth-layout";
import { EmailPasswordForgot } from "@/components/auth/EmailPasswordForgot";

export default function ForgotPage() {
  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to receive a recovery link."
    >
      <EmailPasswordForgot />

      <div className="mt-6 text-center text-xs text-slate-500">
        Remember your password?{" "}
        <a href="/auth/signin" className="font-semibold text-brand-600 hover:text-brand-700 underline">
          Sign In
        </a>
      </div>
    </AuthLayout>
  );
}
