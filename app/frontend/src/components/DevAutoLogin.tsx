import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

// For debugging
const DEBUG = true;

/**
 * Development-only component that automatically logs in using environment variables
 * Only active when VITE_DEV_AUTO_LOGIN is set to true
 */
export default function DevAutoLogin() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [isAutoLoginAttempted, setIsAutoLoginAttempted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Log environment variables to check if they're loaded
    if (DEBUG) {
      console.log(
        "%c DevAutoLogin: Environment variables check",
        "background: #222; color: #bada55; font-size: 14px;"
      );
      console.log("VITE_DEV_AUTO_LOGIN:", import.meta.env.VITE_DEV_AUTO_LOGIN);
      console.log(
        "VITE_DEV_LOGIN_EMAIL:",
        import.meta.env.VITE_DEV_LOGIN_EMAIL
      );
      console.log(
        "VITE_DEV_LOGIN_PASSWORD:",
        import.meta.env.VITE_DEV_LOGIN_PASSWORD
          ? "[password set]"
          : "[password not set]"
      );
      console.log("isAuthenticated:", isAuthenticated);
      console.log("isLoading:", isLoading);
      console.log("isAutoLoginAttempted:", isAutoLoginAttempted);
      console.log("All environment variables:", import.meta.env);
    }

    // Only attempt auto-login if:
    // 1. Auto-login is enabled in environment variables
    // 2. User is not already authenticated
    // 3. Authentication check has completed (isLoading is false)
    // 4. We haven't already attempted auto-login
    const shouldAutoLogin =
      import.meta.env.VITE_DEV_AUTO_LOGIN === "true" &&
      !isAuthenticated &&
      !isLoading &&
      !isAutoLoginAttempted;

    const performAutoLogin = async () => {
      try {
        setIsAutoLoginAttempted(true);

        const email = import.meta.env.VITE_DEV_LOGIN_EMAIL;
        // Remove any quotes from the password
        const password = import.meta.env.VITE_DEV_LOGIN_PASSWORD?.replace(
          /['"`]/g,
          ""
        );

        if (!email || !password) {
          console.warn(
            "DevAutoLogin: Missing email or password in environment variables"
          );
          return;
        }

        console.log(`DevAutoLogin: Attempting auto-login with ${email}`);

        // Use the AuthContext login function instead of direct API call
        // This ensures the auth state is properly updated
        await login(email, password);

        console.log(
          "%c DevAutoLogin: Auto-login successful",
          "background: green; color: white; font-size: 14px;"
        );

        // Clear any existing redirect count
        localStorage.removeItem("redirectCount");

        console.log(
          "%c Setting up authenticated session",
          "background: purple; color: white; font-size: 14px;"
        );

        // Use navigate instead of window.location for proper React Router navigation
        // This avoids a full page reload
        navigate("/app/recipes?auth=fresh");
      } catch (error) {
        console.error(
          "%c DevAutoLogin: Auto-login failed",
          "background: red; color: white; font-size: 14px;",
          error
        );
      }
    };

    if (shouldAutoLogin) {
      performAutoLogin();
    }
  }, [isAuthenticated, isLoading, isAutoLoginAttempted, login, navigate]);

  // This component doesn't render anything
  return null;
}
