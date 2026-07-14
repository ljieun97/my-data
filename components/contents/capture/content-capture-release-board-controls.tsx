"use client";

import {
  CaptureField,
  CaptureHelperText,
  CapturePanel,
  CaptureSizeControls,
  CaptureTextArea,
  CaptureTextInput,
  CaptureToggleButton,
} from "@/components/contents/capture/content-capture-controls";

type ReleaseBoardControlsProps = {
  selectedMoviesCount: number;
  releaseBoardTitle: string;
  setReleaseBoardTitle: (value: string) => void;
  releaseBoardTitleSize: number;
  setReleaseBoardTitleSize: (value: number) => void;
  releaseBoardLabelColors: string[];
  setReleaseBoardLabelColors: (updater: (current: string[]) => string[]) => void;
  releaseBoardDates: string[];
  setReleaseBoardDates: (updater: (current: string[]) => string[]) => void;
  releaseBoardPlaceholders: string[];
  footerLeft: string;
  setFooterLeft: (value: string) => void;
  footerRight: string;
  setFooterRight: (value: string) => void;
};

export function ReleaseBoardControls({
  selectedMoviesCount,
  releaseBoardTitle,
  setReleaseBoardTitle,
  releaseBoardTitleSize,
  setReleaseBoardTitleSize,
  releaseBoardLabelColors,
  setReleaseBoardLabelColors,
  releaseBoardDates,
  setReleaseBoardDates,
  releaseBoardPlaceholders,
  footerLeft,
  setFooterLeft,
  footerRight,
  setFooterRight,
}: ReleaseBoardControlsProps) {
  return (
    <>
      <CapturePanel className="text-sm text-slate-700 dark:text-slate-200">
        <p className="font-bold text-slate-900 dark:text-slate-100">Release Board Mode</p>
        <CaptureHelperText className="mt-2">
          ?? ?? ?? 8?? ?? ??? ?? 4:5 ??? ?????.
        </CaptureHelperText>
        <CaptureHelperText className="mt-3">?? {selectedMoviesCount}/8?</CaptureHelperText>
      </CapturePanel>

      <CapturePanel>
        <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Cover Text</p>
        <CaptureField label="Title" className="mb-3">
          <CaptureTextArea value={releaseBoardTitle} onChange={(event) => setReleaseBoardTitle(event.target.value)} rows={2} />
          <CaptureSizeControls value={releaseBoardTitleSize} defaultValue={23} onChange={setReleaseBoardTitleSize} step={2} min={18} max={36} />
        </CaptureField>

        <div className="mb-3">
          <span className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">Date Label Colors</span>
          <div className="grid grid-cols-4 gap-2">
            {releaseBoardLabelColors.map((color, index) => (
              <label key={`release-color-${index}`} className="flex items-center gap-2 border border-slate-200 bg-white px-2 py-2 dark:border-slate-800 dark:bg-slate-900/60">
                <input
                  type="color"
                  value={color}
                  onChange={(event) =>
                    setReleaseBoardLabelColors((current) =>
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
            {releaseBoardDates.map((dateLabel, index) => (
              <label key={`release-date-${index}`} className="block">
                <span className="mb-1 block text-[11px] font-bold text-slate-500 dark:text-slate-400">{index + 1}</span>
                <input
                  value={dateLabel}
                  onChange={(event) =>
                    setReleaseBoardDates((current) =>
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

        <CaptureHelperText>??? ?? ???? ?? ????, ?? ???? ???? ?? ?????.</CaptureHelperText>
        <CaptureHelperText className="mt-1">??? ?? Movies ???? ?? ???? ??? ??? ??? ??? ?????.</CaptureHelperText>

        <CapturePanel className="mt-3 bg-white/72 p-3 dark:bg-slate-900/60">
          <CaptureField label="Footer Left" className="mb-3">
            <CaptureTextInput value={footerLeft} onChange={(event) => setFooterLeft(event.target.value)} />
          </CaptureField>
          <CaptureField label="Footer Right">
            <CaptureTextInput value={footerRight} onChange={(event) => setFooterRight(event.target.value)} />
          </CaptureField>
        </CapturePanel>
      </CapturePanel>
    </>
  );
}
