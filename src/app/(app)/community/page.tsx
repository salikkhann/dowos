import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function CommunityPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold text-foreground mb-1">Community</h1>
      <p className="text-sm text-muted-foreground mb-6">Announcements, lost &amp; found, and more</p>

      <div className="space-y-3">
        <Link href="/community" className="block">
          <Card className="glass-card border-0 hover:scale-[1.01] transition-transform cursor-pointer">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Announcements</p>
                <p className="text-xs text-muted-foreground">University &amp; batch announcements</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/community/lost-found" className="block">
          <Card className="glass-card border-0 hover:scale-[1.01] transition-transform cursor-pointer">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="h-11 w-11 rounded-xl bg-accent/10 flex items-center justify-center">
                <Search className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Lost &amp; Found</p>
                <p className="text-xs text-muted-foreground">Search-based item recovery</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/community/marketplace" className="block">
          <Card className="glass-card border-0 hover:scale-[1.01] transition-transform cursor-pointer opacity-60">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center">
                <span className="text-lg">🛍️</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Marketplace</p>
                <p className="text-xs text-muted-foreground">Phase 2 – Week 7</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
