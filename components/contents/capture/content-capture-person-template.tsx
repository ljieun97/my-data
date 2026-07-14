import { CapturePerson } from "@/context/CaptureContentContext";
import {
  CaptureFooter,
  getDualPersonTitle,
  getProfileUrl,
  getTitleGroupStyle,
  isExternalImageUrl,
  titleFontStyle,
} from "@/components/contents/capture/content-capture-utils";

export function PersonCoverTemplate({
  persons,
  headline,
  titleSize,
  kicker,
  subtitleChipClass,
  subbody,
  body,
  showTitle,
  showSubtitle,
  showSubbody,
  showBody,
  footerLeft,
  footerRight,
}: {
  persons: CapturePerson[];
  headline: string;
  titleSize: number;
  kicker: string;
  subtitleChipClass: string;
  subbody: string;
  body: string;
  showTitle: boolean;
  showSubtitle: boolean;
  showSubbody: boolean;
  showBody: boolean;
  footerLeft: string;
  footerRight: string;
}) {
  const primaryPerson = persons[0] ?? null;
  const secondaryPerson = persons[1] ?? null;
  const tertiaryPerson = persons[2] ?? null;
  const profileUrl = getProfileUrl(primaryPerson?.profile_path);
  const secondaryProfileUrl = getProfileUrl(secondaryPerson?.profile_path);
  const tertiaryProfileUrl = getProfileUrl(tertiaryPerson?.profile_path);
  const bodyValue = body || primaryPerson?.biography || "";
  const isDualLayout = Boolean(primaryPerson && secondaryPerson);
  const isTripleLayout = Boolean(primaryPerson && secondaryPerson && tertiaryPerson);
  const hasDetailText = (showSubbody && Boolean(subbody)) || (showBody && Boolean(bodyValue));

  return (
    <div className="relative h-full overflow-hidden bg-slate-950 text-white">
      {isTripleLayout ? (
        <div className="absolute inset-0 flex">
          {[
            { person: primaryPerson, url: profileUrl },
            { person: secondaryPerson, url: secondaryProfileUrl },
            { person: tertiaryPerson, url: tertiaryProfileUrl },
          ].map(({ person, url }) => (
            <div key={person?.id} className="h-full w-1/3 bg-slate-900">
              {url ? (
                <img
                  alt=""
                  src={url}
                  className="h-full w-full object-cover object-bottom"
                  crossOrigin={isExternalImageUrl(person?.profile_path) ? undefined : "anonymous"}
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : isDualLayout ? (
        <>
          {profileUrl ? (
            <img
              alt=""
              src={profileUrl}
              className="absolute inset-y-0 left-0 h-full w-1/2 object-cover object-bottom"
              crossOrigin={isExternalImageUrl(primaryPerson?.profile_path) ? undefined : "anonymous"}
            />
          ) : null}
          {secondaryProfileUrl ? (
            <img
              alt=""
              src={secondaryProfileUrl}
              className="absolute inset-y-0 right-0 h-full w-1/2 object-cover object-bottom"
              crossOrigin={isExternalImageUrl(secondaryPerson?.profile_path) ? undefined : "anonymous"}
            />
          ) : null}
        </>
      ) : profileUrl ? (
        <img
          alt=""
          src={profileUrl}
          className="absolute inset-0 h-full w-full object-cover object-bottom"
          crossOrigin={isExternalImageUrl(primaryPerson?.profile_path) ? undefined : "anonymous"}
        />
      ) : null}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.04)_38%,rgba(0,0,0,0.35)_68%,rgba(0,0,0,0.78)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 z-[1] px-10 pb-1 pt-24">
        <div className={hasDetailText ? "pb-1" : "pb-[36px]"}>
          <div className="flex flex-col justify-end" style={getTitleGroupStyle(titleSize)}>
            {showSubtitle ? <p style={titleFontStyle} className={subtitleChipClass}>{kicker || "TOVIE PERSON"}</p> : null}
            {showTitle ? (
              <div className="mt-2">
                <h1 style={{ ...titleFontStyle, fontSize: `${titleSize}px` }} className="break-keep whitespace-pre-line font-black leading-[1.06] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.38)]">
                  {headline || getDualPersonTitle(persons)}
                </h1>
              </div>
            ) : null}
          </div>
          {showSubbody && subbody ? (
            <p style={titleFontStyle} className="mt-1 whitespace-pre-line text-[11px] font-normal leading-[1.4] text-white/72">
              {subbody}
            </p>
          ) : null}
          {showBody && bodyValue ? (
            <p style={titleFontStyle} className="mt-1 whitespace-pre-line text-[13px] font-normal leading-[1.42] text-white">
              {bodyValue}
            </p>
          ) : null}
        </div>
        <CaptureFooter footerLeft={footerLeft} footerRight={footerRight} />
      </div>
    </div>
  );
}

