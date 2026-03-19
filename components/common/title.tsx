"use client"

const Title = ({title, sub} : {title: string, sub: any}) => {
  return (
    <div className="page-title-wrap mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="page-title text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">{title}</h1>
        {sub ? <p className="page-subtitle mt-1 text-sm">{sub}</p> : null}
      </div>
    </div>
  )
}

export default Title
