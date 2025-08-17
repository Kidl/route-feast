import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Route,
  Calendar,
  Settings,
  FileText,
  Download,
  Home,
  ChefHat,
  UtensilsCrossed,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/admin", icon: BarChart3 },
  { title: "Restauranter", url: "/admin/restaurants", icon: ChefHat },
  { title: "Menyer & Retter", url: "/admin/menus", icon: UtensilsCrossed },
  { title: "Ruter", url: "/admin/routes", icon: Route },
  { title: "Bookinger", url: "/admin/bookings", icon: Calendar },
  { title: "Meldinger", url: "/admin/notifications", icon: FileText },
  { title: "Eksporter", url: "/admin/export", icon: Download },
  { title: "Innstillinger", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === "/admin";
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const active = isActive(path);
    return active 
      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
      : "hover:bg-muted/50";
  };

  return (
    <Sidebar className={collapsed ? "w-[72px]" : "w-64"} collapsible="icon">
      <SidebarContent className="py-4">
        {/* Logo/Brand */}
        <div className="px-4 mb-6">
          <NavLink 
            to="/" 
            className="flex items-center gap-3 text-primary font-bold"
          >
            <Home className="h-6 w-6" />
            {!collapsed && <span className="text-lg">GastroRoute</span>}
          </NavLink>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Admin
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClasses(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      {collapsed && (
        <div className="absolute top-4 right-2">
          <SidebarTrigger className="h-8 w-8" />
        </div>
      )}
    </Sidebar>
  );
}