"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@repo/db/client";
import { ShieldCheck, ArrowRight, MessageSquare } from "lucide-react";

export default function OnboardingSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Mark onboarding complete in Supabase
    async function completeOnboarding() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("profiles").update({
          onboarding_complete: true,
          onboarding_step: 10,
        }).eq("id", user.id);
      }
    }

    completeOnboarding();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl text-center space-y-6 border border-slate-200 dark:border-slate-800">
        
        {/* Animated Checkmark Badge */}
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-20 h-20 bg-brand-100 dark:bg-brand-950/60 rounded-full flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-md relative"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1] }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <ShieldCheck className="w-10 h-10" />
            </motion.div>
            
            {/* Pulsing ring */}
            <span className="absolute -inset-2 rounded-full border-2 border-brand-200 dark:border-brand-800 animate-ping opacity-75" />
          </motion.div>
        </div>

        {/* Welcome Headers */}
        <div className="space-y-2">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-3xl font-display font-bold text-slate-900 dark:text-white"
          >
            Welcome to Roomie!
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="text-sm text-slate-500 dark:text-slate-400"
          >
            Your roommate profile has been successfully set up and verified.
          </motion.p>
        </div>

        {/* Support Connection Notice */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/40 rounded-2xl p-5 text-left flex items-start gap-4"
        >
          <div className="p-2.5 bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 rounded-xl flex-shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-brand-800 dark:text-brand-300 text-sm">Official Support Connection</h3>
            <p className="text-xs text-brand-600 dark:text-brand-400 mt-1 leading-relaxed">
              We have automatically connected you to the official <strong>Roomie.app</strong> support account.
              You can message us directly anytime for support or guidelines.
            </p>
          </div>
        </motion.div>

        {/* Get Started Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="pt-2"
        >
          <button
            onClick={() => router.push("/feed")}
            className="w-full py-4 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group shadow-md"
          >
            Get Started on Feed
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

      </div>
    </div>
  );
}
