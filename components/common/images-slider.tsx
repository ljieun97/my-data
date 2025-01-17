import CardThumb from "../contents/card-thumb"

export default function ImagesSlider(props: any) {
  return (
    <>
      <div className="flex overflow-x-scroll gap-3 pb-6">
        {props.contents.map((content: any, index: number) => (
          <div key={index}>
            <div className="w-[160px] sm:w-[160px] md:w-[180px] lg:w-[200px]">
              <CardThumb content={content}></CardThumb>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}