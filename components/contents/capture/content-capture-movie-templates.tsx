import { CaptureMovie } from "@/context/CaptureContentContext";
import {
  buildImageCandidates,
  CaptureFooter,
  getBackdropUrl,
  getPosterUrl,
  getTextOverlayClass,
  getTitleGroupStyle,
  handleImageFallback,
  titleFontStyle,
} from "@/components/contents/capture/content-capture-utils";

function MovieCaptureRow({
  movie,
  index,
  rounded = true,
  stackCount = 5,
  bottomAligned = false,
  titleLayout = "corner",
  showTitle = true,
  showImageOverlay = true,
}: {
  movie?: CaptureMovie;
  index: number;
  rounded?: boolean;
  stackCount?: number;
  bottomAligned?: boolean;
  titleLayout?: "corner" | "center";
  showTitle?: boolean;
  showImageOverlay?: boolean;
}) {
  const imageCandidates = buildImageCandidates(getBackdropUrl(movie), getPosterUrl(movie));
  const noteValue = movie?.note ?? "";
  const textSizeClass = stackCount >= 8 ? "text-[13px]" : stackCount >= 6 ? "text-[14px]" : "text-[16px]";
  const objectPosition = `center ${movie?.imagePosition ?? 20}%`;
  const isCenterTitle = titleLayout === "center";

  return (
    <div className={["relative min-h-0 flex-1 overflow-hidden bg-slate-900 text-white", rounded ? "" : "rounded-none"].join(" ")}>
      {imageCandidates[0] ? (
        <img
          alt=""
          src={imageCandidates[0]}
          data-fallback-index="0"
          onError={(event) => handleImageFallback(event, imageCandidates)}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition, transform: "scale(1.1)" }}
          crossOrigin="anonymous"
        />
      ) : null}

      {showImageOverlay ? (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.10)_28%,rgba(0,0,0,0)_58%,rgba(0,0,0,0.18)_100%)]" />
          <div
            className={[
              "absolute inset-0",
              isCenterTitle
                ? "bg-[linear-gradient(180deg,rgba(0,0,0,0.10)_0%,rgba(0,0,0,0.38)_50%,rgba(0,0,0,0.10)_100%)]"
                : bottomAligned
                ? "bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.04)_42%,rgba(0,0,0,0.32)_72%,rgba(0,0,0,0.68)_100%)]"
                : "bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0)_46%,rgba(0,0,0,0.14)_100%)]",
            ].join(" ")}
          />
        </>
      ) : null}

      {showTitle ? (
        <div
          className={[
            "relative z-[1] flex px-[16px] py-[14px]",
            isCenterTitle ? "h-full items-center justify-center text-center" : "items-stretch gap-1",
            !isCenterTitle && bottomAligned ? "items-end" : "",
            !isCenterTitle && !bottomAligned ? "items-start" : "",
          ].join(" ")}
        >
          {!isCenterTitle ? <span className="w-0.5 shrink-0 bg-amber-400/90" /> : null}
          <p
            style={titleFontStyle}
            className={[
              "leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.52)] break-normal",
              isCenterTitle ? "line-clamp-2 text-center text-[12px] font-black whitespace-normal" : "text-[10px]",
              !isCenterTitle && bottomAligned ? "line-clamp-2 whitespace-normal" : "",
              !isCenterTitle && !bottomAligned ? "truncate" : "",
            ].join(" ")}
          >
            {movie?.title ?? "영화를 추가하세요"}
            {!isCenterTitle ? <br /> : null}
            {!isCenterTitle && movie?.release_date ? (
              <span className={"text-[8px] text-white/72"}>{movie?.release_date.split("-")[0]}</span>
            ) : null}
          </p>
        </div>
      ) : null}

      {movie?.note && !isCenterTitle ? (
         <div
            style={titleFontStyle}
            className={[
              "absolute right-[16px] top-1/2 -translate-y-1/2 z-[1]",
              "shrink-0 text-right font-black leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.52)] break-normal",
              bottomAligned ? "line-clamp-2 whitespace-normal" : "truncate",
              textSizeClass,
            ].join(" ")}
          >
          {noteValue}
        </div>
      ) : null}
    </div>
  );
}

export function MovieListTemplate({
  slots,
  columns,
  twoColumnTextMode,
  centerTitles,
  footerLeft,
  footerRight,
}: {
  slots: Array<CaptureMovie | undefined>;
  columns: 1 | 2;
  twoColumnTextMode: "corner" | "center";
  centerTitles: string[];
  footerLeft: string;
  footerRight: string;
}) {
  const isTwoColumn = columns === 2;
  const titleLayout = isTwoColumn ? twoColumnTextMode : "corner";
  const shouldUseSharedRowTitle = isTwoColumn && twoColumnTextMode === "center";
  const sharedRowTitleSizeClass = slots.length >= 8 ? "text-[13px]" : slots.length >= 6 ? "text-[14px]" : "text-[16px]";
  const leftSlots = isTwoColumn ? slots.filter((_, index) => index % 2 === 0) : slots;
  const rightSlots = isTwoColumn ? slots.filter((_, index) => index % 2 === 1) : [];
  const pairedSlots = shouldUseSharedRowTitle
    ? Array.from({ length: Math.ceil(slots.length / 2) }, (_, index) => ({
        left: slots[index * 2],
        right: slots[index * 2 + 1],
        rowIndex: index,
      }))
    : [];

  return (
    <div className="relative flex h-full flex-col bg-slate-950 text-white">
      {shouldUseSharedRowTitle ? (
        <div className="flex min-h-0 flex-1 flex-col gap-0 bg-slate-950 px-0 pt-0">
          {pairedSlots.map(({ left, right, rowIndex }) => {
            const defaultTitle = [left?.title, right?.title].filter(Boolean).join(" · ") || "영화를 추가하세요";
            const title = centerTitles[rowIndex]?.trim() || defaultTitle;

            return (
              <div key={`preview-row-${rowIndex}`} className="relative grid min-h-0 flex-1 grid-cols-2 overflow-hidden">
                <MovieCaptureRow
                  movie={left}
                  index={rowIndex * 2}
                  rounded={false}
                  stackCount={pairedSlots.length}
                  bottomAligned
                  titleLayout="center"
                  showTitle={false}
                  showImageOverlay={false}
                />
                <MovieCaptureRow
                  movie={right}
                  index={rowIndex * 2 + 1}
                  rounded={false}
                  stackCount={pairedSlots.length}
                  bottomAligned
                  titleLayout="center"
                  showTitle={false}
                  showImageOverlay={false}
                />
                <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center px-5 text-center">
                  <p
                    style={titleFontStyle}
                    className={[
                      "line-clamp-2 max-w-[82%] shrink-0 break-normal text-center font-black leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.52)]",
                      sharedRowTitleSizeClass,
                    ].join(" ")}
                  >
                    {title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className={[
            "min-h-0 flex-1 bg-slate-950",
            isTwoColumn ? "grid grid-cols-2" : "flex flex-col",
            "gap-0 px-0 pt-0",
          ].join(" ")}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-0">
            {leftSlots.map((movie, index) => (
              <MovieCaptureRow
                key={movie?.id ?? `preview-left-${index}`}
                movie={movie}
                index={index}
                rounded={false}
                stackCount={leftSlots.length}
                bottomAligned={isTwoColumn}
                titleLayout={titleLayout}
              />
            ))}
          </div>
          {isTwoColumn ? (
            <div className="flex min-h-0 flex-1 flex-col gap-0">
              {rightSlots.map((movie, index) => (
                <MovieCaptureRow
                  key={movie?.id ?? `preview-right-${index * 2 + 1}`}
                  movie={movie}
                  index={index * 2 + 1}
                  rounded={false}
                  stackCount={rightSlots.length}
                  bottomAligned={isTwoColumn}
                  titleLayout={titleLayout}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] px-0 pb-1">
        <CaptureFooter footerLeft={footerLeft} footerRight={footerRight} />
      </div>
    </div>
  );
}

export function SingleMovieTemplate({
  movie,
  titleSize,
  subtitleChipClass,
  variant,
  rank,
  footerLeft,
  footerRight,
}: {
  movie: CaptureMovie | undefined;
  titleSize: number;
  subtitleChipClass: string;
  variant: "default" | "spotlight";
  rank: number;
  footerLeft: string;
  footerRight: string;
}) {
  const imageCandidates = buildImageCandidates(getPosterUrl(movie), getBackdropUrl(movie));
  const backgroundCandidates = buildImageCandidates(getPosterUrl(movie));
  const title = movie?.singlePreviewTitle ?? movie?.title ?? "영화를 추가하세요";
  const subtitle = movie?.singlePreviewSubtitle ?? movie?.original_title ?? movie?.title ?? "설명 텍스트";
  const subbody = movie?.singlePreviewSubbody ?? "";
  const body = movie?.singlePreviewBody ?? movie?.overview ?? "여기에 설명을 적어주세요.\n네 줄까지 표시됩니다.";
  const showTitle = movie?.singlePreviewShowTitle ?? true;
  const showSubtitle = movie?.singlePreviewShowSubtitle ?? false;
  const showSubbody = movie?.singlePreviewShowSubbody ?? true;
  const showBody = movie?.singlePreviewShowBody ?? true;
  const subtitleValue = movie?.note || subtitle;
  const subbodyClass = "mt-1 whitespace-pre-line text-[11px] font-normal leading-[1.4] text-white/72";
  const bodyClass = "mt-1 whitespace-pre-line text-[13px] font-normal leading-[1.42] text-white";
  const hasDetailText = (showSubbody && Boolean(subbody)) || showBody;

  if (variant === "spotlight") {
    return (
      <div className="relative flex h-full flex-col overflow-hidden bg-slate-950 text-white">
        {backgroundCandidates[0] ? (
          <img
            alt=""
            src={backgroundCandidates[0]}
            data-fallback-index="0"
            onError={(event) => handleImageFallback(event, backgroundCandidates)}
            className="absolute inset-0 h-full w-full object-cover object-center blur-md"
            crossOrigin="anonymous"
          />
        ) : null}
        <div className="absolute inset-0 bg-black/32" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_28%,rgba(0,0,0,0)_58%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.48)_0%,rgba(0,0,0,0.18)_25%,rgba(0,0,0,0.16)_52%,rgba(0,0,0,0.72)_100%)]" />

        <div className="relative z-[1] flex h-full flex-col items-center px-10 pb-10 pt-10 text-center">
          {/* <p style={titleFontStyle} className="text-[26px] font-black leading-none text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.48)]">
            {rank}위
          </p> */}

          <div className="flex min-h-0 flex-1 -translate-y-5 items-center justify-center py-5">
            <div className="w-[50%]">
              {imageCandidates[0] ? (
                <img
                  alt=""
                  src={imageCandidates[0]}
                  data-fallback-index="0"
                  onError={(event) => handleImageFallback(event, imageCandidates)}
                  className="w-full rounded-[0.25rem] object-cover shadow-[0_12px_28px_rgba(0,0,0,0.3)]"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="aspect-[2/3] w-full rounded-[0.25rem] bg-white/12" />
              )}
            </div>
          </div>

          <div className="flex w-full -translate-y-5 items-stretch gap-3 text-left">
            <span className="w-0.5 shrink-0 bg-red-500/90" />
            <div className="min-w-0 py-0.5">
              {showTitle ? (
                <p
                  style={{ ...titleFontStyle, fontSize: `${titleSize}px` }}
                  className="line-clamp-2 whitespace-pre-line text-left font-black leading-[1.14] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.52)] [word-break:keep-all]"
                >
                  {title || "영화를 추가하세요"}
                </p>
              ) : null}
              {subtitleValue ? (
                <p style={titleFontStyle} className="mt-2 text-left text-[11px] font-normal leading-tight text-white/88">
                  {subtitleValue}
                </p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-[2] px-10 pb-1">
          <CaptureFooter footerLeft={footerLeft} footerRight={footerRight} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-slate-950 text-white">
      {imageCandidates[0] ? (
        <img
          alt=""
          src={imageCandidates[0]}
          data-fallback-index="0"
          onError={(event) => handleImageFallback(event, imageCandidates)}
          className="absolute inset-0 h-full w-full object-cover object-center"
          crossOrigin="anonymous"
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.04)_38%,rgba(0,0,0,0.35)_68%,rgba(0,0,0,0.78)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 z-[1] px-10 pb-1 pt-24">
        <div className={["w-full text-left", hasDetailText ? "pb-1" : "pb-[36px]"].join(" ")}>
          <div className="flex flex-col justify-end" style={getTitleGroupStyle(titleSize)}>
            {showSubtitle ? <p style={titleFontStyle} className={["truncate", subtitleChipClass].join(" ")}>{subtitleValue || "설명 텍스트"}</p> : null}
            {showTitle ? (
              <div className="mt-2">
                <h1 style={{ ...titleFontStyle, fontSize: `${titleSize}px` }} className="min-w-0 flex-1 break-keep whitespace-pre-line font-black leading-[1.06] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.38)]">
                  {title || movie?.title || "영화를 추가하세요"}
                </h1>
              </div>
            ) : null}
          </div>
          {showSubbody && subbody ? <p style={titleFontStyle} className={subbodyClass}>{subbody}</p> : null}
          {showBody ? <p style={titleFontStyle} className={bodyClass}>{body || "여기에 설명을 적어주세요.\n네 줄까지 표시됩니다."}</p> : null}
        </div>
        <CaptureFooter footerLeft={footerLeft} footerRight={footerRight} />
      </div>
    </div>
  );
}

