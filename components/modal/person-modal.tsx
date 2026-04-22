"use client";

import { faArrowLeft, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PersonModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const scrollY = window.scrollY;

    document.documentElement.classList.add("modal-scroll-lock");
    document.body.classList.add("modal-scroll-lock");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => {
      document.documentElement.classList.remove("modal-scroll-lock");
      document.body.classList.remove("modal-scroll-lock");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/36 p-3 backdrop-blur-[2px] sm:p-8 lg:p-12 xl:p-16"
      onClick={() => router.back()}
    >
      <div
        className="relative h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_28px_72px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-950 dark:shadow-[0_32px_80px_rgba(2,6,23,0.48)] sm:h-[calc(100dvh-7rem)] sm:max-w-4xl lg:h-[calc(100dvh-9rem)] lg:max-w-[68rem] xl:h-[calc(100dvh-11rem)] xl:max-w-[72rem]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-4">
          <button
            type="button"
            className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-sm text-slate-900 shadow-lg"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <button
            type="button"
            className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-sm text-slate-900 shadow-lg"
            onClick={() => router.back()}
            aria-label="Close modal"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="h-full overflow-y-auto px-5 pb-10 pt-20 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
