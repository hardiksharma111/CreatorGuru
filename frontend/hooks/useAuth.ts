import { useCallback, useEffect, useState } from "react";
import { AuthUser, AUTH_STORAGE_KEY, createDemoAuthUser, readJson, removeJson, writeJson } from "../lib/persistence";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const nextUser = readJson<AuthUser>(AUTH_STORAGE_KEY);
    setUser(nextUser && nextUser.id ? nextUser : null);
    setIsLoading(false);

    const onStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_STORAGE_KEY) {
        return;
      }

      const stored = readJson<AuthUser>(AUTH_STORAGE_KEY);
      setUser(stored && stored.id ? stored : null);
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const signInDemo = useCallback(() => {
    const demoUser = createDemoAuthUser();
    writeJson(AUTH_STORAGE_KEY, demoUser);
    setUser(demoUser);
  }, []);

  const signOut = useCallback(() => {
    removeJson(AUTH_STORAGE_KEY);
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    signInDemo,
    signOut
  };
}

