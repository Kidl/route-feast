import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin_logged_in");
    
    if (isLoggedIn !== "true") {
      // Redirect to login with the current location
      navigate("/login", { 
        state: { from: location },
        replace: true 
      });
    }
  }, [navigate, location]);

  // Check if logged in
  const isLoggedIn = localStorage.getItem("admin_logged_in") === "true";
  
  if (!isLoggedIn) {
    return null; // Don't render anything while redirecting
  }

  return <>{children}</>;
}