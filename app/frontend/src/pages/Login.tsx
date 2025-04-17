import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import PasswordInput from "../components/PasswordInput";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDevOptions, setShowDevOptions] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // Handle normal login form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await login(email, password);
      navigate("/app/recipes");
    } catch (err: unknown) {
      console.error("Login error:", err);
      const error = err as Error;
      setError(
        error.message || "Failed to log in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle direct login with environment variables
  const handleDirectLogin = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Use credentials from environment variables or fallback to test user
      const devEmail =
        import.meta.env.VITE_DEV_LOGIN_EMAIL || "john@example.com";
      const devPassword =
        import.meta.env.VITE_DEV_LOGIN_PASSWORD || "password123";

      await login(devEmail, devPassword);
      setSuccess("Login successful!");

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/app/recipes");
      }, 1000);
    } catch (err: unknown) {
      console.error("Login error:", err);
      const error = err as Error;
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }, [login, navigate]);

  // Handle emergency login (direct API call)
  const handleEmergencyLogin = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess("Attempting emergency login...");

      // Clear any existing auth data
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("redirectCount");

      // Make a direct fetch request to the login endpoint
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "john@example.com",
          password: "password123",
        }),
      });

      const data = await response.json();

      if (data.success && data.token && data.user) {
        setSuccess("Emergency login successful! Setting up session...");

        // Store the token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Wait a moment to ensure localStorage is updated
        setTimeout(() => {
          // Use window.location for a hard redirect
          window.location.href = "/app/recipes";
        }, 1000);
      } else {
        setError(`Login failed: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Add useEffect to handle auto-login based on URL parameters - only when VITE_DEV_AUTO_LOGIN is true
  useEffect(() => {
    // Only process auto-login modes if VITE_DEV_AUTO_LOGIN is true
    if (import.meta.env.VITE_DEV_AUTO_LOGIN !== "true") return;

    const mode = new URLSearchParams(window.location.search).get("mode");
    if (mode === "direct") {
      handleDirectLogin();
    } else if (mode === "emergency") {
      handleEmergencyLogin();
    }
  }, [handleDirectLogin, handleEmergencyLogin]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <PasswordInput
              id="password"
              name="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>

            {/* Developer options toggle - only shown when VITE_DEV_AUTO_LOGIN is true */}
            {import.meta.env.VITE_DEV_AUTO_LOGIN === "true" && (
              <>
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setShowDevOptions(!showDevOptions)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    {showDevOptions
                      ? "Hide developer options"
                      : "Show developer options"}
                  </button>
                </div>

                {/* Developer login options */}
                {showDevOptions && (
                  <div className="mt-4 space-y-4 border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-700">
                      Developer Options
                    </h3>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={handleDirectLogin}
                        disabled={loading}
                        className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Quick Login
                      </button>
                      <button
                        type="button"
                        onClick={handleEmergencyLogin}
                        disabled={loading}
                        className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Emergency Login
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      These options are for development and testing purposes
                      only.
                    </p>
                  </div>
                )}
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
