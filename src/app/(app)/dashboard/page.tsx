import {
  BookOpen,
  Bot,
  Mic,
  Calendar,
  CheckCircle2,
  Bell,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Quick-action card ─────────────────────────────────────────────────────
function QuickAction({
  icon: Icon,
  label,
  href,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  color: string; // tailwind bg class
}) {
  return (
    <a
      href={href}
      className={cn(
        "glass-card rounded-xl p-4 flex flex-col items-center gap-2 text-center",
        "hover:scale-[1.03] transition-transform cursor-pointer",
      )}
    >
      <div className={cn("h-11 w-11 rounded-full flex items-center justify-center", color)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <span className="text-xs font-medium text-foreground">{label}</span>
    </a>
  );
}

// ── Timetable stub row ────────────────────────────────────────────────────
function TimetableRow({
  time,
  subject,
  location,
  color,
}: {
  time: string;
  subject: string;
  location: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <div className={cn("w-1 h-10 rounded-full shrink-0", color)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{subject}</p>
        <p className="text-xs text-muted-foreground truncate">{location}</p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
    </div>
  );
}

// ── Announcement stub ────────────────────────────────────────────────────
function AnnouncementItem({
  title,
  time,
  urgent,
}: {
  title: string;
  time: string;
  urgent?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-border last:border-0">
      {urgent && <Badge variant="destructive" className="shrink-0 text-xs">Urgent</Badge>}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">
          Good morning, Student
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Here's your day at a glance</p>
      </div>

      {/* ── Bento Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

        {/* Quick actions – span full width */}
        <div className="col-span-2 md:col-span-3 grid grid-cols-4 gap-3">
          <QuickAction icon={Bot} label="AI Tutor" href="/ai" color="bg-primary" />
          <QuickAction icon={BookOpen} label="MCQ Solver" href="/education/mcq" color="bg-[#3498db]" />
          <QuickAction icon={Mic} label="Viva Bot" href="/education/viva" color="bg-accent" />
          <QuickAction icon={TrendingUp} label="Progress" href="/education/progress" color="bg-[#27ae60]" />
        </div>

        {/* Today's timetable – spans 2 cols on desktop */}
        <Card className="col-span-2 glass-card border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Today's Schedule
              </CardTitle>
              <Badge variant="secondary">Monday</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <TimetableRow
              time="8:00 AM"
              subject="Cardiology – Lecture"
              location="Lecture Hall 1"
              color="bg-primary"
            />
            <TimetableRow
              time="10:00 AM"
              subject="Anatomy – Lab"
              location="Lab Block A"
              color="bg-accent"
            />
            <TimetableRow
              time="1:00 PM"
              subject="Physiology – Tutorial"
              location="Room 204"
              color="bg-[#3498db]"
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Tap a class to mark attendance
            </p>
          </CardContent>
        </Card>

        {/* Attendance runway – 1 col */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#27ae60]" />
              Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Module mini-bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Cardiology</span>
                <span className="font-mono font-semibold text-foreground">82%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-full w-4/5 rounded-full bg-[#27ae60]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Anatomy</span>
                <span className="font-mono font-semibold text-foreground">76%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-full rounded-full bg-[#f39c12]" style={{ width: "76%" }} />
              </div>
            </div>

            {/* Runway */}
            <div className="rounded-lg bg-accent/10 border border-accent/30 p-2.5 mt-1">
              <p className="text-xs font-semibold text-accent-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Runway Calculator
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                You can safely skip <span className="font-mono font-bold text-accent-foreground">3</span> more classes
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Announcements strip – full width */}
        <Card className="col-span-2 md:col-span-3 glass-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnnouncementItem
              title="Viva schedule for Cardiology posted – check your roll number"
              time="2 hours ago"
              urgent
            />
            <AnnouncementItem
              title="Library hours extended this week until 9 PM"
              time="Yesterday"
            />
            <AnnouncementItem
              title="New batch of lab coats available in Merch store"
              time="2 days ago"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
