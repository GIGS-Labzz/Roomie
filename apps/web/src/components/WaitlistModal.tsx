"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { createClient } from "@supabase/supabase-js";
import paymentSuccessAnimation from "@repo/animations/payment-success";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const WHATSAPP_LINK = "https://chat.whatsapp.com/JmlbvtVELMWA0xsjxzwHZI";

interface Props {
  open: boolean;
  onClose: () => void;
}

type State = "form" | "loading" | "success" | "error";

const fields = [
  { name: "full_name",   label: "Full name",       type: "text",  placeholder: "Amara Okafor"         },
  { name: "email",       label: "Email address",   type: "email", placeholder: "amara@gmail.com"      },
  { name: "phone",       label: "Phone number",    type: "tel",   placeholder: "+234 801 234 5678"    },
  { name: "university",  label: "Workplace or School (Optional)", type: "text", placeholder: "e.g., UNILAG, Chevron, Freelance" },
  { name: "city",        label: "City",            type: "text",  placeholder: "Lagos"                },
] as const;

type FieldName = typeof fields[number]["name"];

export function WaitlistModal({ open, onClose }: Props) {
  const [state, setState] = useState<State>("form");
  const [values, setValues] = useState<Record<FieldName, string>>({
    full_name: "", email: "", phone: "", university: "", city: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  // Reset form when re-opened
  useEffect(() => {
    if (open) {
      setState("form");
      setValues({ full_name: "", email: "", phone: "", university: "", city: "" });
      setErrorMsg("");
    }
  }, [open]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    const { error } = await supabase.from("waitlist").insert({
      full_name: values.full_name.trim(),
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim(),
      university: values.university.trim(),
      city: values.city.trim(),
    });

    if (error) {
      setErrorMsg(error.message);
      setState("error");
    } else {
      setState("success");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={state !== "loading" ? onClose : undefined}
            className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.94, y: 16  }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_24px_64px_rgba(0,0,0,0.18)]">

              {/* Close button */}
              {state !== "success" && (
                <button
                  onClick={onClose}
                  disabled={state === "loading"}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-40"
                >
                  <X size={15} className="text-slate-600" />
                </button>
              )}

              <AnimatePresence mode="wait">

                {/* ── Form state ── */}
                {(state === "form" || state === "error" || state === "loading") && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8"
                  >
                    {/* Header */}
                    <div className="mb-7 pr-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                        Internal beta — limited spots
                      </div>
                      <h2 className="font-display font-semibold text-2xl text-slate-900 leading-tight mb-2">
                        Join the waitlist
                      </h2>
                      <p className="text-slate-500 text-sm">
                        Be among the first to try Roomie. We'll add you to our WhatsApp group for early access.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                      {fields.map((field) => (
                        <div key={field.name}>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            {field.label}
                          </label>
                          <input
                            type={field.type}
                            placeholder={field.placeholder}
                            required={field.name !== "university"}
                            value={values[field.name]}
                            onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                            disabled={state === "loading"}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 text-slate-900 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all disabled:opacity-50"
                          />
                        </div>
                      ))}

                      {state === "error" && (
                        <p className="text-red-500 text-xs font-medium bg-red-50 px-4 py-2.5 rounded-xl">
                          {errorMsg}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={state === "loading"}
                        className="mt-1 w-full flex items-center justify-center gap-2 py-3.5 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white font-semibold rounded-xl text-sm transition-colors shadow-brutal-sm"
                      >
                        {state === "loading" ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Saving your spot…
                          </>
                        ) : (
                          <>
                            Join waitlist
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>

                      <p className="text-center text-[11px] text-slate-400">
                        No spam — just early access and updates.
                      </p>
                    </form>
                  </motion.div>
                )}

                {/* ── Success state ── */}
                {state === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 flex flex-col items-center text-center"
                  >
                    <div className="w-40 h-40 mb-2">
                      <Lottie animationData={paymentSuccessAnimation} loop={false} autoplay style={{ width: "100%", height: "100%" }} />
                    </div>

                    <h2 className="font-display font-semibold text-2xl text-slate-900 mb-2">
                      You're on the list!
                    </h2>
                    <p className="text-slate-500 text-sm mb-8 max-w-xs">
                      Welcome to the Roomie beta. Join our WhatsApp group to get early access and share feedback with the team.
                    </p>

                    <a
                      href={WHATSAPP_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm text-white transition-colors shadow-brutal-sm"
                      style={{ background: "#25D366" }}
                    >
                      <WhatsAppIcon />
                      Join WhatsApp group
                    </a>

                    <button
                      onClick={onClose}
                      className="mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Maybe later
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}
