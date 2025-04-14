import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// For debugging
const DEBUG = true;

/**
 * Component that redirects authenticated users away from public routes
 * to the authenticated experience
 */
export default function AuthRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if:
    // 1. User is authenticated
    // 2. Authentication check has completed (isLoading is false)
    // 3. User is on a public route (/, /login, /register, /test-login)
    if (isAuthenticated && !isLoading) {
      if (DEBUG) {
        console.log(
          "%c AuthRedirect: User is authenticated, checking path",
          "background: purple; color: white; font-size: 14px;"
        );
        console.log("Current path:", location.pathname);
      }
      
      // Don't redirect if already on an authenticated route
      if (!location.pathname.startsWith('/app/')) {
        console.log('AuthRedirect: Redirecting to authenticated experience');
        navigate('/app/recipes');
      }
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  // This component doesn't render anything
  return null;
}
