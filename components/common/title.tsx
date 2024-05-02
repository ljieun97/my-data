"use client"

const Title = (props :any) => {
  return (
    <div className="p-2 gab-1">
      <span className="font-bold text-2xl">{props.title}</span>
      <span className="text-default-400 pl-1">{props.sub}</span>
    </div>
  )
}

export default Title