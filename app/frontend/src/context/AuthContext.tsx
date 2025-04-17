import { useState, useEffect, ReactNode } from "react";
import { api } from "../api";
import { AuthContext, User } from "./AuthContextValue";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored auth state on component mount
  useEffect(() => {
    console.log(
      "%c AuthContext: Initializing",
      "background: #4b0082; color: white; font-size: 14px;"
    );
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    console.log("Stored token exists:", !!storedToken);
    console.log("Stored user exists:", !!storedUser);

    // Clear any redirect count on initial load
    if (window.location.search.includes("auth=fresh")) {
      localStorage.removeItem("redirectCount");
      console.log("Fresh auth detected, cleared redirect count");
    }

    if (storedUser && storedToken) {
      try {
        // Try to parse the stored user data
        const userData = JSON.parse(storedUser);
        console.log("Found stored user data:", userData);
        console.log(
          "User ID type:",
          typeof userData.id,
          "User ID value:",
          userData.id
        );

        // Ensure user ID is a number
        if (typeof userData.id === "string") {
          userData.id = parseInt(userData.id, 10);
          console.log("Converted user ID to number:", userData.id);
        }

        // Set the user state directly
        setUser(userData);
        console.log(
          "%c User state set from localStorage",
          "background: green; color: white; font-size: 14px;"
        );
        console.log("Final user state:", userData);

        // Set the token in the API client
        api.setAuthToken(storedToken);
        console.log("Set auth token in API client");
      } catch (err) {
        console.error("Error parsing stored user data:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("redirectCount");
      }
    } else {
      console.log("No stored user data or token found");
      // Ensure user is null if no stored data
      setUser(null);
    }

    // Check if user is already logged in with the server
    const checkAuthStatus = async () => {
      try {
        // If we have a fresh auth from the URL parameter, skip server check
        if (window.location.search.includes("auth=fresh")) {
          console.log(
            "%c Fresh auth detected, skipping server check",
            "background: green; color: white; font-size: 14px;"
          );
          setIsLoading(false);
          return;
        }

        if (!storedToken) {
          console.log("No stored token, skipping server auth check");
          setIsLoading(false);
          return;
        }

        console.log(
          "%c Checking authentication status with server...",
          "background: blue; color: white; font-size: 14px;"
        );
        console.log(
          "Using token:",
          storedToken ? "[token exists]" : "[no token]"
        );
        setIsLoading(true);

        try {
          const data = await api.auth.me();
          console.log("Server auth check response:", data);

          if (data && data.user) {
            console.log(
              "%c Server confirmed user is authenticated",
              "background: green; color: white; font-size: 14px;"
            );
            console.log("User data from server:", data.user);
            console.log(
              "User ID type from server:",
              typeof data.user.id,
              "User ID value:",
              data.user.id
            );

            // Ensure user ID is a number for consistency
            if (typeof data.user.id === "string") {
              data.user.id = parseInt(data.user.id, 10);
              console.log("Converted user ID to number:", data.user.id);
            }

            setUser(data.user);
            // Update stored user data
            localStorage.setItem("user", JSON.stringify(data.user));
            console.log(
              "Updated stored user data with ID type:",
              typeof data.user.id
            );
            // Clear any redirect count
            localStorage.removeItem("redirectCount");
          } else if (storedUser && storedToken) {
            // Server couldn't confirm authentication but we have stored credentials
            // Keep using the stored user data instead of clearing it
            console.log(
              "%c Server couldn't confirm auth but using stored credentials",
              "background: orange; color: black; font-size: 14px;"
            );

            // We'll keep the current user state and stored data
            console.log("Keeping stored user data for this session");
          } else {
            // No stored credentials and server says not authenticated
            console.log(
              "%c No stored credentials and server says not authenticated",
              "background: red; color: white; font-size: 14px;"
            );

            // Clear any stored data
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("redirectCount");
            api.setAuthToken(""); // Clear token in API client
            setUser(null);
            console.log("Cleared stored auth data");
          }
        } catch (apiErr) {
          console.log(
            "%c API call failed, but keeping stored credentials",
            "background: orange; color: black; font-size: 14px;"
          );
          console.error("Error checking auth status:", apiErr);

          // Instead of clearing stored data, we'll keep using it
          // This prevents logout on network errors or API issues
          if (storedUser && storedToken) {
            console.log("Keeping stored credentials despite API error");
          } else {
            console.log("No stored credentials to keep");
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("redirectCount");
            api.setAuthToken(""); // Clear token in API client
            setUser(null);
          }
        }
      } catch (err) {
        // Not authenticated, that's okay
        console.log(
          "%c Auth check failed",
          "background: red; color: white; font-size: 14px;",
          err
        );
        // Clear stored data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        api.setAuthToken(""); // Clear token in API client
        setUser(null);
        console.log("Cleared stored auth data due to error");
      } finally {
        setIsLoading(false);
        console.log("Auth check completed, isLoading set to false");
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    console.log(
      "%c Login function called",
      "background: orange; color: black; font-size: 14px;"
    );
    console.log("Email:", email);
    setIsLoading(true);
    try {
      console.log("Calling API login...");
      const data = await api.auth.login(email, password);
      console.log("Login API response:", data);

      if (data && data.user && data.token) {
        console.log(
          "%c Login successful",
          "background: green; color: white; font-size: 14px;"
        );
        console.log("Setting user in auth context:", data.user);
        console.log(
          "User ID type:",
          typeof data.user.id,
          "User ID value:",
          data.user.id
        );

        // Ensure user ID is a number for consistency
        if (typeof data.user.id === "string") {
          data.user.id = parseInt(data.user.id, 10);
          console.log("Converted user ID to number:", data.user.id);
        }

        // First set the token in the API client
        api.setAuthToken(data.token);
        console.log("Set auth token in API client");

        // Then store user data and token in localStorage for persistence
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        console.log(
          "Stored user data and token in localStorage with ID type:",
          typeof data.user.id
        );

        // Finally update the user state
        setUser(data.user);
        console.log("Updated user state in context");

        // Verify localStorage was updated
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");
        console.log("Verified localStorage updates:");
        console.log("- User stored:", !!storedUser);
        console.log("- Token stored:", !!storedToken);
        console.log("- isAuthenticated will be set to:", true);
      } else {
        console.error(
          "%c Login failed: Invalid response",
          "background: red; color: white; font-size: 14px;"
        );
        console.error("Login API response missing user data or token:", data);
        throw new Error("Invalid login response");
      }
    } catch (error) {
      console.error(
        "%c Login error",
        "background: red; color: white; font-size: 14px;",
        error
      );
      throw error;
    } finally {
      setIsLoading(false);
      console.log("Login process completed, isLoading set to false");
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // No need to call the backend for logout with JWT
      // Just clear the local state

      // Clear user from state
      setUser(null);
      // Clear user and token from localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("redirectCount");
      // Clear the Authorization header
      api.setAuthToken("");
      console.log(
        "%c User logged out and localStorage cleared",
        "background: green; color: white; font-size: 14px;"
      );
    } catch (error) {
      console.error(
        "%c Error during logout",
        "background: red; color: white; font-size: 14px;",
        error
      );
      // Still clear local state even if there's an error
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("redirectCount");
      api.setAuthToken("");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }) => {
    setIsLoading(true);
    try {
      await api.auth.register(userData);
      // Note: We don't automatically log the user in after registration
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// useAuth hook moved to separate file
