import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import RouteDetail from "./pages/RouteDetail";
import NotFound from "./pages/NotFound";
import { Admin } from "./pages/Admin";
import { AdminRoutes } from "./pages/admin/AdminRoutes";
import { AdminBookings } from "./pages/admin/AdminBookings";
import { AdminNotifications } from "./pages/admin/AdminNotifications";
import { AdminExport } from "./pages/admin/AdminExport";
import { AdminSettings } from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/route/:routeId" element={<RouteDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/routes" element={<AdminRoutes />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/export" element={<AdminExport />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
