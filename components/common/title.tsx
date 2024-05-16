"use client"

const Title = (props :any) => {
  return (
    <div className="gab-1">
      <span className="font-bold text-2xl">{props.title}</span>
      <span className="text-default-400 pl-2">{props.sub}</span>
    </div>
  )
}

export default Title