import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Sonner } from "@/components/ui/sonner";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import RouteDetail from "./pages/RouteDetail";
import RestaurantPage from "./pages/RestaurantPage";
import MenuPage from "./pages/MenuPage";
import RestaurantsPage from "./pages/RestaurantsPage";
import AdminRestaurants from "./pages/admin/AdminRestaurants";
import AdminRoutes from "./pages/admin/AdminRoutes";
import AdminMenus from "./pages/admin/AdminMenus";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminExport from "./pages/admin/AdminExport";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  { path: "/", element: <Index /> },
  { path: "/route/:routeId", element: <RouteDetail /> },
  { path: "/restaurants", element: <RestaurantsPage /> },
  { path: "/restaurant/:restaurantId", element: <RestaurantPage /> },
  { path: "/restaurant/:restaurantId/menu", element: <MenuPage /> },
  { path: "/login", element: <Login /> },
  { path: "/admin", element: <ProtectedRoute><Admin /></ProtectedRoute> },
  { path: "/admin/restaurants", element: <ProtectedRoute><AdminRestaurants /></ProtectedRoute> },
  { path: "/admin/routes", element: <ProtectedRoute><AdminRoutes /></ProtectedRoute> },
  { path: "/admin/menus", element: <ProtectedRoute><AdminMenus /></ProtectedRoute> },
  { path: "/admin/bookings", element: <ProtectedRoute><AdminBookings /></ProtectedRoute> },
  { path: "/admin/settings", element: <ProtectedRoute><AdminSettings /></ProtectedRoute> },
  { path: "/admin/notifications", element: <ProtectedRoute><AdminNotifications /></ProtectedRoute> },
  { path: "/admin/export", element: <ProtectedRoute><AdminExport /></ProtectedRoute> },
  { path: "*", element: <NotFound /> },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
