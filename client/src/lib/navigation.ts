import {
    TrendingUp,
    Users,
    Map,
    MapPin,
    Clock,
    Package,
    Image,
    Gauge,
    Bell,
    BarChart3,
    FileText,
    Brain,
    Smartphone,
    LayoutDashboard
} from "lucide-react";

export interface NavItem {
    href: string;
    label: string;
    icon: any;
}

export const NAV_ITEMS: NavItem[] = [
    { href: "/", label: "Dashboard", icon: TrendingUp },
    { href: "/customers", label: "Customers", icon: Users },
    { href: "/customers-map", label: "Customer Map", icon: Map },
    { href: "/routes", label: "Routes", icon: MapPin },
    { href: "/visits", label: "Visits", icon: Clock },
    { href: "/orders", label: "Orders", icon: Package },
    { href: "/products", label: "Products", icon: Package },
    { href: "/photo-gallery", label: "Photo Gallery", icon: Image },
    { href: "/mileage-tracking", label: "Mileage Tracking", icon: Gauge },
    { href: "/tracking", label: "Live Tracking", icon: MapPin },
    { href: "/alerts", label: "Alerts", icon: Bell },
    { href: "/manager", label: "Manager Dashboard", icon: BarChart3 },
    { href: "/mileage-reports", label: "Mileage Reports", icon: Gauge },
    { href: "/internal-notes", label: "Internal Notes History", icon: FileText },
    { href: "/reports", label: "Reports", icon: FileText },
    { href: "/predictive-analytics", label: "Predictive Analytics", icon: Brain },
    { href: "/sales-coach", label: "AI Sales Coach", icon: Brain },
    { href: "/mobile-settings", label: "Mobile Settings", icon: Smartphone },
    { href: "/hubspot-settings", label: "HubSpot Integration", icon: Package },
];
