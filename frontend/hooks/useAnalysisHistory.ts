import { useCallback, useEffect, useState } from "react";
import { ANALYSIS_HISTORY_KEY, AnalysisHistoryEntry, readAnalysisHistory, removeJson, writeJson } from "../lib/persistence";

export function useAnalysisHistory() {
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(readAnalysisHistory());

    const onStorage = (event: StorageEvent) => {
      if (event.key !== ANALYSIS_HISTORY_KEY) {
        return;
      }

      setHistory(readAnalysisHistory());
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const refresh = useCallback(() => {
    setHistory(readAnalysisHistory());
  }, []);

  const clearHistory = useCallback(() => {
    removeJson(ANALYSIS_HISTORY_KEY);
    setHistory([]);
  }, []);

  const replaceHistory = useCallback((nextHistory: AnalysisHistoryEntry[]) => {
    writeJson(ANALYSIS_HISTORY_KEY, nextHistory);
    setHistory(nextHistory);
  }, []);

  return {
    history,
    refresh,
    clearHistory,
    replaceHistory
  };
}