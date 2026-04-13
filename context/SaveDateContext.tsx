"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type SaveDateMode = "release" | "today" | "custom";
type CustomSaveSelection = {
  date: string;
  rating: number;
};

type SaveDateContextValue = {
  mode: SaveDateMode;
  setMode: (mode: SaveDateMode) => void;
  requestDate: (initialDate?: string, initialRating?: number) => Promise<CustomSaveSelection | null>;
  requestDuplicateAction: (payload: { existingDate?: string | null; nextDate?: string | null }) => Promise<"keep" | "change" | null>;
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
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [selectedRating, setSelectedRating] = useState(2.5);
  const [duplicateDates, setDuplicateDates] = useState<{ existingDate?: string | null; nextDate?: string | null }>({});
  const dateResolverRef = useRef<((value: CustomSaveSelection | null) => void) | null>(null);
  const duplicateResolverRef = useRef<((value: "keep" | "change" | null) => void) | null>(null);

  useEffect(() => {
    setModeState(readInitialMode());
  }, []);

  const setMode = useCallback((nextMode: SaveDateMode) => {
    setModeState(nextMode);
    localStorage.setItem(STORAGE_KEY, nextMode);
    localStorage.setItem(LEGACY_STORAGE_KEY, nextMode === "today" ? "true" : "false");
  }, []);

  const closeDateModal = useCallback((value: CustomSaveSelection | null) => {
    const resolver = dateResolverRef.current;
    dateResolverRef.current = null;
    setIsDateModalOpen(false);
    window.setTimeout(() => {
      resolver?.(value);
    }, 0);
  }, []);

  const closeDuplicateModal = useCallback((value: "keep" | "change" | null) => {
    const resolver = duplicateResolverRef.current;
    duplicateResolverRef.current = null;
    setIsDuplicateModalOpen(false);
    window.setTimeout(() => {
      resolver?.(value);
    }, 0);
  }, []);

  const requestDate = useCallback((initialDate?: string, initialRating?: number) => {
    setSelectedDate(initialDate || getTodayDate());
    setSelectedRating(typeof initialRating === "number" && initialRating > 0 ? initialRating : 2.5);
    setIsDateModalOpen(true);

    return new Promise<CustomSaveSelection | null>((resolve) => {
      dateResolverRef.current = resolve;
    });
  }, []);

  const requestDuplicateAction = useCallback((payload: { existingDate?: string | null; nextDate?: string | null }) => {
    setDuplicateDates(payload);
    setIsDuplicateModalOpen(true);

    return new Promise<"keep" | "change" | null>((resolve) => {
      duplicateResolverRef.current = resolve;
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      mode,
      setMode,
      requestDate,
      requestDuplicateAction,
    }),
    [mode, requestDate, requestDuplicateAction, setMode],
  );

  return (
    <SaveDateContext.Provider value={contextValue}>
      {children}
      {isDateModalOpen ? (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/72 p-4 backdrop-blur-sm" onClick={() => closeDateModal(null)}>
          <div
            className="w-full max-w-sm rounded-[28px] border border-slate-200/70 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-200/70 px-6 py-4 text-lg font-semibold dark:border-slate-800">Choose date</div>
            <div className="px-6 py-5">
              <div className="flex flex-col gap-5">
                <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Save date</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="min-h-[2.85rem] rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                </label>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Rating</span>
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 10 }, (_, index) => (index + 1) / 2).map((value) => {
                      const isActive = Math.abs(selectedRating - value) < 0.001;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setSelectedRating(value)}
                          className={[
                            "inline-flex min-h-[2.5rem] items-center justify-center rounded-xl border px-2 text-sm transition",
                            isActive
                              ? "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-400 dark:bg-amber-500/15 dark:text-amber-200"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-600",
                          ].join(" ")}
                        >
                          {value.toFixed(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200/70 px-6 py-4 dark:border-slate-800">
              <button type="button" className="rounded-full border px-4 py-2 text-sm" onClick={() => closeDateModal(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white dark:bg-slate-100 dark:text-slate-900"
                onClick={() => closeDateModal({ date: selectedDate, rating: selectedRating })}
              >
                Save with this date
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {isDuplicateModalOpen ? (
        <div className="fixed inset-0 z-[131] flex items-center justify-center bg-slate-950/72 p-4 backdrop-blur-sm" onClick={() => closeDuplicateModal(null)}>
          <div
            className="w-full max-w-sm rounded-[28px] border border-slate-200/70 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-200/70 px-6 py-4 text-lg font-semibold dark:border-slate-800">이미 저장된 영화입니다</div>
            <div className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
              <p>기존 저장 날짜를 유지할지, 새 날짜로 바꿀지 선택해주세요.</p>
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-700 dark:text-slate-200">현재 날짜</span>
                  <span>{duplicateDates.existingDate || "-"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-700 dark:text-slate-200">변경 날짜</span>
                  <span>{duplicateDates.nextDate || "직접 선택"}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200/70 px-6 py-4 dark:border-slate-800">
              <button type="button" className="rounded-full border px-4 py-2 text-sm" onClick={() => closeDuplicateModal("keep")}>
                유지
              </button>
              <button
                type="button"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white dark:bg-slate-100 dark:text-slate-900"
                onClick={() => closeDuplicateModal("change")}
              >
                날짜 변경
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
