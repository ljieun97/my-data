import PersonModal from "@/components/modal/person-modal";

export default function Loading() {
  return (
    <PersonModal>
      <div className="flex flex-col gap-6">
        <section className="browse-card overflow-hidden rounded-[30px] border p-4 sm:p-6">
          <div className="grid gap-5 md:grid-cols-[12rem_1fr]">
            <div className="aspect-[2/3] animate-pulse rounded-[24px] bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-4">
              <div className="h-8 w-56 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="flex gap-2">
                <div className="h-8 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="h-8 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </PersonModal>
  );
}
