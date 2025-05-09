"use client"

import { Card, Skeleton } from '@heroui/react';

export function BannersSkel() {
  return (
    <>
      <Card
        radius="none"
        className="border-none"
      >
        <Skeleton>
          {/* <div className="h-[200px] sm:h-[400px] md:h-[540px] lg:h-[702px] bg-default-300"></div> */}
          <div className="w-screen h-[600px] object-cover"></div>
        </Skeleton>
      </Card >
    </>
  )
}