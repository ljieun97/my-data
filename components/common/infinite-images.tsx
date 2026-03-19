import CardInfo from "../contents/card-info"
import CardThumb from "../contents/card-thumb"

export default function InfiniteImages(props: any) {
  let style
  if (props.type == "info")
    style = "grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
  else
    style = "grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
  return (
    <>
      <div className={style}>
        {props.contents?.map((content: any, index: number) => (
          props.type == "info" ?
            <CardInfo key={index} content={content}></CardInfo> :
            <CardThumb key={index} content={content}></CardThumb>
        ))}
      </div>
    </>
  )
}
