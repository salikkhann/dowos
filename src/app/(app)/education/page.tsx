import { BookOpen, Mic, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const SECTIONS = [
  {
    icon: BookOpen,
    title: "MCQ Solver",
    desc: "12,000+ questions across all modules – free forever.",
    href: "/education/mcq",
    badge: "Free",
  },
  {
    icon: Mic,
    title: "Viva Bot",
    desc: "Voice-based viva practice with adaptive scoring (50 pts).",
    href: "/education/viva",
    badge: "Pro",
  },
  {
    icon: TrendingUp,
    title: "Progress Matrix",
    desc: "Module → Subject → Subtopic mastery breakdown.",
    href: "/education/progress",
    badge: null,
  },
];

export default function EducationPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold text-foreground mb-1">Education</h1>
      <p className="text-sm text-muted-foreground mb-6">Your learning tools in one place</p>

      <div className="space-y-3">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href}>
              <Card className="glass-card border-0 hover:scale-[1.01] transition-transform cursor-pointer">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{s.title}</p>
                      {s.badge && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground font-medium">
                          {s.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
