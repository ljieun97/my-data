import CardInfo from "../contents/card-info"
import CardThumb from "../contents/card-thumb"

export default function InfiniteImages(props: any) {
  let style
  if (props.type == "info")
    style = "media-recommendation-grid media-recommendation-grid--info grid gap-4"
  else
    style = "media-recommendation-grid grid gap-4"
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
