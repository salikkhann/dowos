/**
 * Auth layout – shared shell for signup / login / verify / onboarding.
 * Centred single-column, no nav chrome.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      {/* Logo */}
      <span
        className="text-3xl font-extrabold tracking-tight text-foreground mb-10"
        style={{ fontFamily: "var(--font-display)" }}
      >
        DowOS
      </span>

      {/* Card shell */}
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
