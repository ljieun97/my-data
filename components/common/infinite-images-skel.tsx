import { Card, Skeleton } from "@nextui-org/react";

export default function InfiniteImagesSkel() {
  return (
    <>
      <div className="gap-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {[...Array(18)].map((item: any, index: number) => (
          <Card radius="sm" key={index}>
            <Skeleton >
              <div className="w-[210px] h-[250px] sm:h-[270px] md:h-[290px] lg:h-[290px]  bg-default-300"></div>
            </Skeleton>
          </Card>
         ))} 
      </div>
    </>
  )
}