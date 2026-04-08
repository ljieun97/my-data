"use client"

const Title = ({
  title,
  sub,
  compact = true,
}: {
  title: string,
  sub: any,
  compact?: boolean,
}) => {
  return (
    <div className={`page-title-wrap flex flex-wrap items-end justify-between gap-3 ${compact ? "mb-3" : "mb-6"}`}>
      <div>
        <h1 className={`page-title font-semibold ${compact ? "text-lg tracking-[-0.05em]" : "text-2xl tracking-[-0.03em] sm:text-3xl"}`}>{title}</h1>
        {sub ? <p className="page-subtitle mt-1 text-sm">{sub}</p> : null}
      </div>
    </div>
  )
}

export default Title
