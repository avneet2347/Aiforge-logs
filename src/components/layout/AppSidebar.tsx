import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Activity, 
  Network, 
  AlertTriangle, 
  LineChart, 
  Server, 
  TerminalSquare 
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { title: "Overview", href: "/", icon: LayoutDashboard },
  { title: "Anomalies", href: "/anomalies", icon: Activity },
  { title: "Patterns", href: "/patterns", icon: Network },
  { title: "Alerts", href: "/alerts", icon: AlertTriangle },
  { title: "Predictions", href: "/predictions", icon: LineChart },
  { title: "Services", href: "/services", icon: Server },
  { title: "Logs Exploration", href: "/logs", icon: TerminalSquare },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2 font-mono font-bold text-lg text-sidebar-primary">
          <Activity className="w-5 h-5 text-primary" />
          <span>AIForge</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive = location === item.href;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 text-xs text-sidebar-foreground/50 font-mono">
        v0.1.0-alpha
      </SidebarFooter>
    </Sidebar>
  );
}
