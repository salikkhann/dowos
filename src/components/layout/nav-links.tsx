import {
  LayoutDashboard,
  BookOpen,
  Bot,
  MapPin,
  Users,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Education", href: "/education", icon: BookOpen },
  { label: "AI Assistant", href: "/ai", icon: Bot },
  { label: "Maps", href: "/maps", icon: MapPin },
  { label: "Community", href: "/community", icon: Users },
];
