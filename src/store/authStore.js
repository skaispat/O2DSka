import { create } from "zustand";
import { persist } from "zustand/middleware";
import supabase from "../SupabaseClient";

const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,

      login: async (username, password) => {
        set({ isLoading: true });

        try {
          // Query Supabase master table
          const { data, error } = await supabase
            .from('master')
            .select('user_id, user_name, password, role, page')
            .eq('user_name', username)
            .single();

          if (error) {
            console.error("Supabase error:", error);
            throw new Error("User not found or database error");
          }

          if (!data) {
            throw new Error("Invalid username");
          }

          // Check password (plain text comparison - consider hashing in production)
          if (data.password !== password) {
            throw new Error("Invalid password");
          }

          // Login successful
          const user = {
            id: data.user_id,
            username: data.user_name,
            name: data.user_name, // Using username as name since there's no separate name field
            role: data.role,
            page: data.page
          };

          set({
            isAuthenticated: true,
            user: user,
            isLoading: false,
          });

          return true;

        } catch (error) {
          console.error("Login error:", error);
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