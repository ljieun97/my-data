import { Card, Skeleton } from "@nextui-org/react";

export default function InfiniteImagesSkel() {
  return (
    <>
      <div className="gap-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {[...Array(24)].map((item: any, index: number) => (
          <Card radius="sm" key={index}>
            <Skeleton >
              <div className="w-[200px] h-[235px] sm:h-[235px] md:h-[235px] lg:h-[240px]  bg-default-300"></div>
              {/* <div className="w-[210px] h-[250px] bg-default-300"></div> */}
            </Skeleton>
          </Card>
         ))} 
      </div>
    </>
  )
}