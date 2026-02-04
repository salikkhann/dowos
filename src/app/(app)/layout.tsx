import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* Sidebar – visible md and up */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {/* Top bar – mobile only: logo + notification bell */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
          <span
            className="text-lg font-extrabold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            DowOS
          </span>
        </header>

        {/* Page content */}
        <div className="p-4 md:p-6">{children}</div>
      </main>

      {/* Mobile bottom nav – visible below md */}
      <div className="md:hidden">
        <MobileNav />
      </div>
    </div>
  );
}
