import InfiniteImages from "../common/infinite-images"

export default function MyLikes(props: any) {
  const { contents } = props

  return (
    <>
      {/* {JSON.stringify(movies)} */}
      <div className="max-h-[600px] overflow-scroll" >
        <InfiniteImages contents={contents} />
      </div >
    </>
  )
}