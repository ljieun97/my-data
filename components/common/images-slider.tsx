import CardThumb from "../contents/card-thumb"

export default function ImagesSlider(props: any) {
  return (
    <>
      <div className="flex overflow-x-scroll gap-3 pb-6">
        {props.contents.map((content: any, index: number) => (
          <div key={index}>
            <div className="w-[120px] sm:w-[150px] md:w-[160px] lg:w-[160px] ">
            {/* <div className="w-[150px]"> */}
              {/* <div className="w-40 sm:w-40 md:w-60 lg:w-80"> */}
              {/* <div className="h-40 sm:h-40 md:h-60 lg:h-80"> */}
              <CardThumb content={content}></CardThumb>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}