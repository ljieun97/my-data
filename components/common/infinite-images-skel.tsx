import { Card, Skeleton } from "@heroui/react";

export default function InfiniteImagesSkel() {
  return (
    <>
      <div className="gap-2 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-8">
        {[...Array(18)].map((item: any, index: number) => (
          <Card radius="sm" key={index}>
            <Skeleton >
              <div className="w-[160px] sm:w-[160px] md:w-[180px] lg:w-[200px] bg-default-300"></div>
            </Skeleton>
          </Card>
        ))}
      </div>
    </>
  )
}