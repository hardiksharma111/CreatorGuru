export function useAuth() {
  return {
    user: {
      id: "demo-user-1",
      name: "Hardik Sharma",
      email: "hardik.creator@example.com",
      plan: "Free"
    },
    isLoading: false,
    isAuthenticated: true
  };
}

