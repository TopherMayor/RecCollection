import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Navbar from "../Navbar";

export default function AuthenticatedLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Debug authentication state
  console.log(
    "%c AuthenticatedLayout: Authentication Check",
    "background: #4b0082; color: white; font-size: 14px;"
  );
  console.log("isAuthenticated:", isAuthenticated);
  console.log("isLoading:", isLoading);
  console.log("user:", user);
  console.log(
    "localStorage token:",
    localStorage.getItem("token") ? "[exists]" : "[not found]"
  );
  console.log(
    "localStorage user:",
    localStorage.getItem("user") ? "[exists]" : "[not found]"
  );

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log("AuthenticatedLayout: Showing loading spinner");
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Check if we're in a redirect loop
  const redirectCount = parseInt(localStorage.getItem("redirectCount") || "0");
  console.log("Current redirect count:", redirectCount);

  // If we have a token but isAuthenticated is false, try to use the token
  if (
    !isAuthenticated &&
    localStorage.getItem("token") &&
    localStorage.getItem("user") &&
    redirectCount < 3 // Prevent infinite loops
  ) {
    console.log(
      "%c AuthenticatedLayout: Token exists but not authenticated",
      "background: orange; color: black; font-size: 14px;"
    );

    // Increment redirect count to prevent loops
    localStorage.setItem("redirectCount", (redirectCount + 1).toString());

    // Try to parse the stored user data to see if it's valid
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "");
      console.log("Stored user data:", userData);

      // Instead of reloading, manually set the user in localStorage and redirect
      console.log("Manually setting user from localStorage");

      // Return a loading state instead of redirecting
      return (
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600">Restoring your session...</p>
        </div>
      );
    } catch (err) {
      console.error("Error parsing stored user data:", err);
      // Clear localStorage to break the loop
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("redirectCount");
      // If we can't parse the user data, redirect to login
      return <Navigate to="/login" />;
    }
  }

  // Reset redirect count if authenticated
  if (isAuthenticated) {
    localStorage.removeItem("redirectCount");
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log(
      "%c AuthenticatedLayout: User is not authenticated, redirecting to /login",
      "background: red; color: white; font-size: 14px;"
    );
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      <footer className="bg-gray-800 text-white py-4 sm:py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm sm:text-base">
            © {new Date().getFullYear()} RecCollection. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
