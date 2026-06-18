"use client";

import {
  CaptureField,
  CaptureHelperText,
  CapturePanel,
  CaptureSizeControls,
  CaptureTextArea,
  CaptureTextInput,
  CaptureToggleButton,
} from "@/components/contents/content-capture-controls";

type CalendarCaptureControlsProps = {
  isCalendarReleaseMode: boolean;
  isCalendarMode: boolean;
  isCalendarLoading: boolean;
  calendarError: string;
  selectedMoviesCount: number;
  calendarResultsCount: number;
  calendarReleaseTitle: string;
  setCalendarReleaseTitle: (value: string) => void;
  calendarReleaseTitleSize: number;
  setCalendarReleaseTitleSize: (value: number) => void;
  calendarReleaseLabelColors: string[];
  setCalendarReleaseLabelColors: (updater: (current: string[]) => string[]) => void;
  calendarReleaseDates: string[];
  setCalendarReleaseDates: (updater: (current: string[]) => string[]) => void;
  releaseBoardPlaceholders: string[];
  calendarTitle: string;
  setCalendarTitle: (value: string) => void;
  calendarTitleSize: number;
  setCalendarTitleSize: (value: number) => void;
  showCalendarTitle: boolean;
  setShowCalendarTitle: (updater: (current: boolean) => boolean) => void;
  footerLeft: string;
  setFooterLeft: (value: string) => void;
  footerRight: string;
  setFooterRight: (value: string) => void;
  handleCopyCalendarText: () => void;
  calendarTextForCopy: string;
  didCopyText: boolean;
};

export function CalendarCaptureControls({
  isCalendarReleaseMode,
  isCalendarMode,
  isCalendarLoading,
  calendarError,
  selectedMoviesCount,
  calendarResultsCount,
  calendarReleaseTitle,
  setCalendarReleaseTitle,
  calendarReleaseTitleSize,
  setCalendarReleaseTitleSize,
  calendarReleaseLabelColors,
  setCalendarReleaseLabelColors,
  calendarReleaseDates,
  setCalendarReleaseDates,
  releaseBoardPlaceholders,
  calendarTitle,
  setCalendarTitle,
  calendarTitleSize,
  setCalendarTitleSize,
  showCalendarTitle,
  setShowCalendarTitle,
  footerLeft,
  setFooterLeft,
  footerRight,
  setFooterRight,
  handleCopyCalendarText,
  calendarTextForCopy,
  didCopyText,
}: CalendarCaptureControlsProps) {
  return (
    <>
      <CapturePanel className="text-sm text-slate-700 dark:text-slate-200">
        <p className="font-bold text-slate-900 dark:text-slate-100">{isCalendarReleaseMode ? "Release Board Mode" : "Calendar Mode"}</p>
        <CaptureHelperText className="mt-2">
          {isCalendarReleaseMode ? "직접 고른 영화 8개를 날짜 라벨과 함께 4:5 보드로 배치합니다." : "달력 페이지 내용을 그대로 표시합니다. 상단 download 버튼으로 캡처하세요."}
        </CaptureHelperText>
        {isCalendarMode && isCalendarLoading ? <p className="mt-3 text-xs">불러오는 중...</p> : null}
        {calendarError ? <p className="mt-3 text-xs text-rose-500">{calendarError}</p> : null}
        {isCalendarReleaseMode ? (
          <CaptureHelperText className="mt-3">영화 {selectedMoviesCount}/8개</CaptureHelperText>
        ) : !isCalendarLoading && !calendarError ? (
          <CaptureHelperText className="mt-3">이벤트 {calendarResultsCount}개</CaptureHelperText>
        ) : null}
      </CapturePanel>

      <CapturePanel>
        <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Cover Text</p>
        {isCalendarReleaseMode ? (
          <>
            <CaptureField label="Title" className="mb-3">
              <CaptureTextArea value={calendarReleaseTitle} onChange={(event) => setCalendarReleaseTitle(event.target.value)} rows={2} />
              <CaptureSizeControls value={calendarReleaseTitleSize} defaultValue={23} onChange={setCalendarReleaseTitleSize} step={2} min={18} max={36} />
            </CaptureField>

            <div className="mb-3">
              <span className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">Date Label Colors</span>
              <div className="grid grid-cols-4 gap-2">
                {calendarReleaseLabelColors.map((color, index) => (
                  <label key={`release-color-${index}`} className="flex items-center gap-2 border border-slate-200 bg-white px-2 py-2 dark:border-slate-800 dark:bg-slate-900/60">
                    <input
                      type="color"
                      value={color}
                      onChange={(event) =>
                        setCalendarReleaseLabelColors((current) =>
                          current.map((entry, entryIndex) => (entryIndex === index ? event.target.value : entry)),
                        )
                      }
                      className="h-7 w-7 cursor-pointer border-0 bg-transparent p-0"
                    />
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{index + 1}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <span className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">Date Labels</span>
              <div className="grid grid-cols-2 gap-2">
                {calendarReleaseDates.map((dateLabel, index) => (
                  <label key={`release-date-${index}`} className="block">
                    <span className="mb-1 block text-[11px] font-bold text-slate-500 dark:text-slate-400">{index + 1}</span>
                    <input
                      value={dateLabel}
                      onChange={(event) =>
                        setCalendarReleaseDates((current) =>
                          current.map((entry, entryIndex) => (entryIndex === index ? event.target.value : entry)),
                        )
                      }
                      placeholder={releaseBoardPlaceholders[index] || "6/5"}
                      className="h-9 w-full border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                    />
                  </label>
                ))}
              </div>
            </div>

            <CaptureHelperText>날짜는 영화 개봉일로 자동 채워지고, 입력하면 그 값이 우선 적용됩니다.</CaptureHelperText>
            <CaptureHelperText className="mt-1">영화는 아래 Movies 영역에서 직접 추가하고 순서를 바꾸면 보드에 그대로 반영됩니다.</CaptureHelperText>
          </>
        ) : (
          <>
            <CaptureField label="Title" className="mb-3">
              <CaptureTextArea value={calendarTitle} onChange={(event) => setCalendarTitle(event.target.value)} rows={2} />
              <CaptureSizeControls value={calendarTitleSize} defaultValue={28} onChange={setCalendarTitleSize} step={2} min={24} max={48} />
            </CaptureField>
            <CaptureToggleButton type="button" active={showCalendarTitle} onClick={() => setShowCalendarTitle((current) => !current)}>
              Title {showCalendarTitle ? "ON" : "OFF"}
            </CaptureToggleButton>
          </>
        )}

        <CapturePanel className="mt-3 bg-white/72 p-3 dark:bg-slate-900/60">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Copy Text</p>
            <button
              type="button"
              onClick={handleCopyCalendarText}
              disabled={!calendarTextForCopy}
              className="h-8 border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-45 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {didCopyText ? "copied" : "copy"}
            </button>
          </div>
          <pre className="min-h-24 whitespace-pre-wrap border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
            {calendarTextForCopy || "캘린더 데이터가 로드되면 복사용 텍스트가 표시됩니다."}
          </pre>
        </CapturePanel>
      </CapturePanel>
    </>
  );
}
