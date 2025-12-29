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
    roles?: ("admin" | "manager" | "user" | "rep")[];
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
    { href: "/manager", label: "Manager Dashboard", icon: BarChart3, roles: ["admin", "manager"] },
    { href: "/mileage-reports", label: "Mileage Reports", icon: Gauge, roles: ["admin", "manager"] },
    { href: "/internal-notes", label: "Internal Notes History", icon: FileText, roles: ["admin", "manager"] },
    { href: "/reports", label: "Reports", icon: FileText, roles: ["admin", "manager"] },
    { href: "/predictive-analytics", label: "Predictive Analytics", icon: Brain, roles: ["admin", "manager"] },
    { href: "/sales-coach", label: "AI Sales Coach", icon: Brain },
    { href: "/mobile-settings", label: "Mobile Settings", icon: Smartphone, roles: ["admin", "manager"] },
    { href: "/hubspot-settings", label: "HubSpot Integration", icon: Package, roles: ["admin"] },
    { href: "/distributors", label: "Distributors", icon: Package, roles: ["admin"] },
    { href: "/company-admin", label: "Company Admin", icon: Users, roles: ["admin"] },
];
