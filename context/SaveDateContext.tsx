"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type SaveDateMode = "release" | "today" | "custom";

type SaveDateContextValue = {
  mode: SaveDateMode;
  setMode: (mode: SaveDateMode) => void;
  requestDate: (initialDate?: string) => Promise<string | null>;
};

const SaveDateContext = createContext<SaveDateContextValue | null>(null);

const STORAGE_KEY = "set_saveDateMode";
const LEGACY_STORAGE_KEY = "set_isTodaySave";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function readInitialMode(): SaveDateMode {
  if (typeof window === "undefined") {
    return "release";
  }

  const savedMode = localStorage.getItem(STORAGE_KEY);
  if (savedMode === "release" || savedMode === "today" || savedMode === "custom") {
    return savedMode;
  }

  return localStorage.getItem(LEGACY_STORAGE_KEY) === "true" ? "today" : "release";
}

export function SaveDateProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<SaveDateMode>("release");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const resolverRef = useRef<((value: string | null) => void) | null>(null);

  useEffect(() => {
    setModeState(readInitialMode());
  }, []);

  const setMode = useCallback((nextMode: SaveDateMode) => {
    setModeState(nextMode);
    localStorage.setItem(STORAGE_KEY, nextMode);
    localStorage.setItem(LEGACY_STORAGE_KEY, nextMode === "today" ? "true" : "false");
  }, []);

  const closeWithValue = useCallback((value: string | null) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setIsModalOpen(false);
  }, []);

  const requestDate = useCallback((initialDate?: string) => {
    setSelectedDate(initialDate || getTodayDate());
    setIsModalOpen(true);

    return new Promise<string | null>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      mode,
      setMode,
      requestDate,
    }),
    [mode, requestDate, setMode],
  );

  return (
    <SaveDateContext.Provider value={contextValue}>
      {children}
      {isModalOpen ? (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/72 p-4 backdrop-blur-sm" onClick={() => closeWithValue(null)}>
          <div
            className="w-full max-w-sm rounded-[28px] border border-slate-200/70 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-200/70 px-6 py-4 text-lg font-semibold dark:border-slate-800">Choose date</div>
            <div className="px-6 py-5">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Save date</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="min-h-[2.85rem] rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200/70 px-6 py-4 dark:border-slate-800">
              <button type="button" className="rounded-full border px-4 py-2 text-sm" onClick={() => closeWithValue(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white dark:bg-slate-100 dark:text-slate-900"
                onClick={() => closeWithValue(selectedDate)}
              >
                Save with this date
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </SaveDateContext.Provider>
  );
}

export function useSaveDate() {
  const context = useContext(SaveDateContext);

  if (!context) {
    throw new Error("useSaveDate must be used within a SaveDateProvider");
  }

  return context;
}
