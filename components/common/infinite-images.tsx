import CardThumb from "../contents/card-thumb"

export default function InfiniteImages(props: any) {
  return (
    <>
      <div className="gap-3 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {props.contents?.map((content: any, index: number) => (
          <div key={index} className="w-full">
            <CardThumb key={index} content={content} ></CardThumb>
          </div>
        ))}
      </div>
    </>
  )
}