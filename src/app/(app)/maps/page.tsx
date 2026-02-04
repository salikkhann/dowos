import { MapPin } from "lucide-react";

export default function MapsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold text-foreground mb-1">Point Routes</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Campus bus routes &amp; real-time driver tracking
      </p>

      <div className="glass-card rounded-xl border-0 p-12 flex flex-col items-center gap-3 text-center">
        <MapPin className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          Map library not yet selected – coming soon
        </p>
        <p className="text-xs text-muted-foreground">
          Google Maps vs OpenLayers decision pending
        </p>
      </div>
    </div>
  );
}
