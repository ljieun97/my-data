"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type SaveDateMode = "release" | "today" | "custom";
type CustomSaveSelection = {
  date: string;
  rating: number;
};
type DuplicateFieldChoice = "keep" | "change";
type DuplicateActionSelection = {
  dateChoice: DuplicateFieldChoice;
  ratingChoice: DuplicateFieldChoice;
};
type DuplicateActionPayload = {
  existingDate?: string | null;
  nextDate?: string | null;
  existingRating?: number | null;
  nextRating?: number | null;
};

type SaveDateContextValue = {
  mode: SaveDateMode;
  setMode: (mode: SaveDateMode) => void;
  requestDate: (initialDate?: string, initialRating?: number) => Promise<CustomSaveSelection | null>;
  requestDuplicateAction: (payload: DuplicateActionPayload) => Promise<DuplicateActionSelection | null>;
};

const SaveDateContext = createContext<SaveDateContextValue | null>(null);

const STORAGE_KEY = "set_saveDateMode";
const LEGACY_STORAGE_KEY = "set_isTodaySave";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeDateInput(date?: string | null) {
  return typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : getTodayDate();
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
  const [duplicatePayload, setDuplicatePayload] = useState<DuplicateActionPayload>({});
  const [dateChoice, setDateChoice] = useState<DuplicateFieldChoice>("change");
  const [ratingChoice, setRatingChoice] = useState<DuplicateFieldChoice>("change");
  const dateResolverRef = useRef<((value: CustomSaveSelection | null) => void) | null>(null);
  const duplicateResolverRef = useRef<((value: DuplicateActionSelection | null) => void) | null>(null);

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
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        resolver?.(value);
      });
    });
  }, []);

  const closeDuplicateModal = useCallback((value: DuplicateActionSelection | null) => {
    const resolver = duplicateResolverRef.current;
    duplicateResolverRef.current = null;
    setIsDuplicateModalOpen(false);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        resolver?.(value);
      });
    });
  }, []);

  const requestDate = useCallback((initialDate?: string, initialRating?: number) => {
    setSelectedDate(normalizeDateInput(initialDate));
    setSelectedRating(typeof initialRating === "number" && initialRating > 0 ? initialRating : 2.5);
    setIsDateModalOpen(true);

    return new Promise<CustomSaveSelection | null>((resolve) => {
      dateResolverRef.current = resolve;
    });
  }, []);

  const requestDuplicateAction = useCallback((payload: DuplicateActionPayload) => {
    setDuplicatePayload(payload);
    setDateChoice("change");
    setRatingChoice("change");
    setIsDuplicateModalOpen(true);

    return new Promise<DuplicateActionSelection | null>((resolve) => {
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
            <div className="border-b border-slate-200/70 px-6 py-4 text-lg font-semibold dark:border-slate-800">날짜 선택</div>
            <div className="px-6 py-5">
              <div className="flex flex-col gap-5">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">저장 날짜</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    className="min-h-[2.85rem] rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </label>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">별점</span>
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
                취소
              </button>
              <button
                type="button"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white dark:bg-slate-100 dark:text-slate-900"
                onClick={() => closeDateModal({ date: selectedDate, rating: selectedRating })}
              >
                이 날짜로 저장
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {isDuplicateModalOpen ? (
        <div className="fixed inset-0 z-[131] flex items-center justify-center bg-slate-950/72 p-4 backdrop-blur-sm" onClick={() => closeDuplicateModal(null)}>
          <div
            className="w-full max-w-md rounded-[28px] border border-slate-200/70 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-200/70 px-6 py-4 text-lg font-semibold dark:border-slate-800">이미 저장된 영화입니다</div>
            <div className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
              <p>날짜와 별점을 각각 선택해 저장할 수 있습니다.</p>
              <div className="mt-4 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <span className="font-medium text-slate-700 dark:text-slate-200">날짜 선택</span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setDateChoice("keep")}
                      className={[
                        "rounded-2xl border p-4 text-left transition",
                        dateChoice === "keep"
                          ? "border-amber-400 bg-amber-50 dark:bg-amber-500/10"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">이전 날짜</span>
                        <span className="text-xs text-slate-400">{dateChoice === "keep" ? "선택됨" : ""}</span>
                      </div>
                      <p className="mt-3">{duplicatePayload.existingDate || "-"}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateChoice("change")}
                      className={[
                        "rounded-2xl border p-4 text-left transition",
                        dateChoice === "change"
                          ? "border-amber-400 bg-amber-50 dark:bg-amber-500/10"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">현재 날짜</span>
                        <span className="text-xs text-slate-400">{dateChoice === "change" ? "선택됨" : ""}</span>
                      </div>
                      <p className="mt-3">{duplicatePayload.nextDate || "직접 선택"}</p>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-medium text-slate-700 dark:text-slate-200">별점 선택</span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setRatingChoice("keep")}
                      className={[
                        "rounded-2xl border p-4 text-left transition",
                        ratingChoice === "keep"
                          ? "border-amber-400 bg-amber-50 dark:bg-amber-500/10"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">이전 별점</span>
                        <span className="text-xs text-slate-400">{ratingChoice === "keep" ? "선택됨" : ""}</span>
                      </div>
                      <p className="mt-3">{typeof duplicatePayload.existingRating === "number" ? duplicatePayload.existingRating.toFixed(1) : "-"}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRatingChoice("change")}
                      className={[
                        "rounded-2xl border p-4 text-left transition",
                        ratingChoice === "change"
                          ? "border-amber-400 bg-amber-50 dark:bg-amber-500/10"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">현재 별점</span>
                        <span className="text-xs text-slate-400">{ratingChoice === "change" ? "선택됨" : ""}</span>
                      </div>
                      <p className="mt-3">{typeof duplicatePayload.nextRating === "number" ? duplicatePayload.nextRating.toFixed(1) : "-"}</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200/70 px-6 py-4 dark:border-slate-800">
              <button type="button" className="rounded-full border px-4 py-2 text-sm" onClick={() => closeDuplicateModal(null)}>
                취소
              </button>
              <button
                type="button"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white dark:bg-slate-100 dark:text-slate-900"
                onClick={() => closeDuplicateModal({ dateChoice, ratingChoice })}
              >
                저장
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
