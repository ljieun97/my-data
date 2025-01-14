import { Card, Skeleton } from "@nextui-org/react";

export default function InfiniteImagesSkel() {
  return (
    <>
      <div className="gap-2 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-8">
        {[...Array(18)].map((item: any, index: number) => (
          <Card radius="sm" key={index}>
            <Skeleton >
              <div className="h-[250px] sm:h-[250px] md:h-[270px] lg:h-[290px]  bg-default-300"></div>
              {/* <div className="w-[210px] h-[250px] bg-default-300"></div> */}
            </Skeleton>
          </Card>
         ))} 
      </div>
    </>
  )
}