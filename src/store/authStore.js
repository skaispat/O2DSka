
import { create } from "zustand";
import { persist } from "zustand/middleware";

const BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbytzkcDJnUk9tKgilwLMh8CSBFYjC_k_kS9wc4a_ylzqTDd2TQH5Z28tiTjWhn7wsfC/exec";

const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,

      login: async (username, password) => {
        console.log("username",username);
        console.log("password",password);
        set({ isLoading: true });

        try {
          // First try JSONP (works with CORS)
          return await get().loginWithJsonp(username, password);
        } catch (error) {
          console.error("JSONP login failed, trying POST:", error);

          // Fallback to POST if JSONP fails
          try {
            const response = await fetch(
              `${BACKEND_URL}?action=login&username=${encodeURIComponent(
                username
              )}&password=${encodeURIComponent(password)}`,
              {
                method: "GET",
                mode: "no-cors", // Important for CORS
              }
            );

            // Handle response
            const result = await response.json();

            if (result.success && result.user) {
              set({
                isAuthenticated: true,
                user: result.user,
                isLoading: false,
              });
              return true;
            } else {
              throw new Error(result.error || "Login failed");
            }
          } catch (postError) {
            set({ isLoading: false });
            console.error("Login error:", postError);
            return false;
          }
        }
      },

      // JSONP fallback method for CORS issues
      loginWithJsonp: async (username, password) => {
        return new Promise((resolve) => {
          const callbackName = `jsonp_callback_${Date.now()}`;
          const script = document.createElement("script");

          // Create global callback function
          window[callbackName] = (result) => {
            // Cleanup
            document.head.removeChild(script);
            delete window[callbackName];

            if (result.success && result.user) {
              set({
                isAuthenticated: true,
                user: {
                  id: result.user.id,
                  username: result.user.username,
                  name: result.user.name || result.user.username,
                  role: result.user.role,
                  page: result.user.page,
                },
                isLoading: false,
              });
              resolve(true);
            } else {
              set({ isLoading: false });
              console.error(
                "JSONP Login failed:",
                result.error || "Unknown error"
              );
              resolve(false); // 🔴 FIX HERE: Make sure to resolve false if login fails
            }
          };

          // Handle script error
          script.onerror = () => {
            document.head.removeChild(script);
            delete window[callbackName];
            set({ isLoading: false });
            console.error("JSONP request failed");
            resolve(false);
          };

          // Set script source with JSONP callback
          script.src = `${BACKEND_URL}?action=login&username=${encodeURIComponent(
            username
          )}&password=${encodeURIComponent(password)}&callback=${callbackName}`;
          document.head.appendChild(script);
        });
      },

      // Direct GET method (use only if CORS is properly configured)
      loginDirect: async (username, password) => {
        set({ isLoading: true });

        try {
          const response = await fetch(
            `${BACKEND_URL}?action=login&username=${encodeURIComponent(
              username
            )}&password=${encodeURIComponent(password)}`,
            {
              method: "GET",
              mode: "cors",
            }
          );

          const result = await response.json();

          if (result.success && result.user) {
            set({
              isAuthenticated: true,
              user: {
                id: result.user.id,
                username: result.user.username,
                name: result.user.name || result.user.username,
                role: result.user.role,
                page: result.user.page,
              },
              isLoading: false,
            });
            return true;
          } else {
            set({ isLoading: false });
            console.error("Login failed:", result.error);
            return false;
          }
        } catch (error) {
          console.error("Direct login error:", error);
          set({ isLoading: false });
          return false;
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      },

      // Get current user info
      getCurrentUser: () => {
        return get().user;
      },

      // Check if user has specific role
      hasRole: (role) => {
        const user = get().user;
        return user && user.role === role;
      },

      // Check if user is admin
      isAdmin: () => {
        const user = get().user;
        return user && user.role === "admin";
      },
    }),
    {
      name: "o2d-auth-storage",
      // Only persist authentication state, not loading state
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);

export default useAuthStore;
