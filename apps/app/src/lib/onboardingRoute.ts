export function getOnboardingRoute(step: number, userType?: string | null): string {
  if (step <= 0) return "/onboarding/type";
  if (step === 1) return "/onboarding/basics";
  if (step === 2) return "/onboarding/demographics";
  if (step === 3) return "/onboarding/nin";
  if (step === 4) return "/onboarding/face";

  // Archetype branch steps (5-7)
  if (step === 5) {
    if (userType === "nysc_corper") return "/onboarding/nysc/callup";
    if (userType === "young_professional") return "/onboarding/professional/occupation";
    return "/onboarding/student/study";
  }

  if (step === 6) {
    if (userType === "nysc_corper") return "/onboarding/nysc/posting";
    if (userType === "young_professional") return "/onboarding/professional/location";
    return "/onboarding/student/institution";
  }

  if (step === 7) {
    if (userType === "nysc_corper") return "/onboarding/nysc/documents";
    if (userType === "young_professional") return "/onboarding/professional/proof";
    return "/onboarding/student/document";
  }

  if (step === 8) return "/onboarding/vibe";
  if (step === 9) return "/onboarding/budget";
  if (step >= 10) return "/onboarding/success";

  return "/onboarding/type";
}
