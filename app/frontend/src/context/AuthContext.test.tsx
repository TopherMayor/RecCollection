import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./AuthContext";
import { mockUser, mockAuthService } from "../test/mocks/api";

// Mock the auth service
import * as authModule from "../api/auth";
vi.spyOn(authModule, "authService").mockImplementation(() => mockAuthService);

// Test component that uses the auth context
const TestComponent = () => {
  const { user, login, logout, loading } = useAuth();

  return (
    <div>
      {loading && <div data-testid="loading">Loading...</div>}
      {user ? (
        <>
          <div data-testid="user-info">
            <div data-testid="username">{user.username}</div>
            <div data-testid="email">{user.email}</div>
          </div>
          <button data-testid="logout-button" onClick={logout}>
            Logout
          </button>
        </>
      ) : (
        <button
          data-testid="login-button"
          onClick={() =>
            login({ email: "test@example.com", password: "password" })
          }
        >
          Login
        </button>
      )}
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Reset mock function calls
    vi.clearAllMocks();
  });

  it("should provide loading state", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("should login user and store token", async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    // Click login button
    await user.click(screen.getByTestId("login-button"));

    // Check if login function was called
    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password",
    });

    // Wait for user info to be displayed
    await waitFor(() => {
      expect(screen.getByTestId("user-info")).toBeInTheDocument();
      expect(screen.getByTestId("username")).toHaveTextContent(
        mockUser.username
      );
      expect(screen.getByTestId("email")).toHaveTextContent(mockUser.email);
    });

    // Check if token was stored in localStorage
    expect(localStorage.getItem("token")).toBe("test-token");
    expect(localStorage.getItem("user")).toBe(JSON.stringify(mockUser));
  });

  it("should logout user and remove token", async () => {
    // Set initial state with logged in user
    localStorage.setItem("token", "test-token");
    localStorage.setItem("user", JSON.stringify(mockUser));

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for user info to be displayed
    await waitFor(() => {
      expect(screen.getByTestId("user-info")).toBeInTheDocument();
    });

    // Click logout button
    await user.click(screen.getByTestId("logout-button"));

    // Check if logout function was called
    expect(mockAuthService.logout).toHaveBeenCalled();

    // Wait for login button to be displayed
    await waitFor(() => {
      expect(screen.getByTestId("login-button")).toBeInTheDocument();
    });

    // Check if token was removed from localStorage
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("should load user from localStorage on mount", async () => {
    // Set initial state with logged in user
    localStorage.setItem("token", "test-token");
    localStorage.setItem("user", JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for user info to be displayed
    await waitFor(() => {
      expect(screen.getByTestId("user-info")).toBeInTheDocument();
      expect(screen.getByTestId("username")).toHaveTextContent(
        mockUser.username
      );
      expect(screen.getByTestId("email")).toHaveTextContent(mockUser.email);
    });

    // Check if getCurrentUser was called
    expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
  });
});
