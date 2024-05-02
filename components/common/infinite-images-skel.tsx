import { Card, Skeleton } from "@nextui-org/react";

export default function InfiniteImagesSkel() {
  return (
    <>
      <div className="gap-2 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-6">
        {[...Array(18)].map((item: any, index: number) => (
          <Card radius="sm" key={index}>
            <Skeleton >
              <div className="w-[240px] h-[200px] sm:h-[280px] md:h-[280px] lg:h-[280px] bg-default-300"></div>
            </Skeleton>
          </Card>
         ))} 
      </div>
    </>
  )
}