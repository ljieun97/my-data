import CardThumb from "../contents/card-thumb"

export default function InfiniteImages(props: any) {
  return (
    <>
      <div className="gap-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6">
      {/* <div className="gap-3 grid grid-cols-12"> */}
        {props.contents?.map((content: any) => (
          <CardThumb key={content._id} content={content} ></CardThumb>
        ))}
      </div>
    </>
  )
}