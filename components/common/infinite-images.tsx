import CardInfo from "../contents/card-info"
import CardThumb from "../contents/card-thumb"

export default function InfiniteImages(props: any) {
  let style
  if(props.type=="info")
    style="gap-2 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 bg-white"
  else 
    style="gap-2 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 bg-white"
  return (
    <>
      <div className={style}>
        {/* <div className="gap-3 grid grid-cols-12"> */}
        {props.contents?.map((content: any, index: number) => (
          props.type == "info" ?
            <CardInfo key={index} content={content} ></CardInfo> :
            <CardThumb key={index} content={content} ></CardThumb>
        ))}
      </div>
    </>
  )
}