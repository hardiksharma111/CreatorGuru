export const AUTH_STORAGE_KEY = "creatorguru-auth-user";
export const ANALYSIS_HISTORY_KEY = "creatorguru-analysis-history";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  plan: string;
  signedInAt: string;
};

export type AnalysisHistoryEntry = {
  id: string;
  kind: "profile" | "audit" | "thumbnail" | "calendar" | "benchmarks" | "trends" | "chat";
  title: string;
  summary: string;
  createdAt: string;
  mode: "demo" | "live";
  details?: Record<string, string | number | boolean>;
};

export function readJson<T>(storageKey: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJson(storageKey: string, value: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(value));
}

export function removeJson(storageKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(storageKey);
}

export function readAnalysisHistory() {
  return readJson<AnalysisHistoryEntry[]>(ANALYSIS_HISTORY_KEY) ?? [];
}

export function addAnalysisHistoryEntry(entry: Omit<AnalysisHistoryEntry, "id" | "createdAt">) {
  const nextEntry: AnalysisHistoryEntry = {
    ...entry,
    id: `${entry.kind}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    createdAt: new Date().toISOString()
  };

  const history = readAnalysisHistory();
  const nextHistory = [nextEntry, ...history].slice(0, 20);
  writeJson(ANALYSIS_HISTORY_KEY, nextHistory);
  return nextEntry;
}

export function clearAnalysisHistory() {
  removeJson(ANALYSIS_HISTORY_KEY);
}

export function createDemoAuthUser(): AuthUser {
  return {
    id: "demo-user-1",
    name: "Creator User",
    email: "creator@example.com",
    plan: "Starter",
    signedInAt: new Date().toISOString()
  };
}