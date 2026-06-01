export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sage-surface flex flex-col">
      {children}
    </div>
  );
}
