'use client'

import MyMovies from "@/components/movie/my-movies"
import { Tab, Tabs } from "@nextui-org/react"
import LikeMovies from "../movie/like-movies"

const MyPage = () => {
  return (
    <>
      <Tabs aria-label="Tabs">
        <Tab key="rating" title="평가한 작품" >
          <MyMovies />
        </Tab>
        <Tab key="like" title="찜한 작품" >
          <LikeMovies />
        </Tab>
      </Tabs>
    </>
  )
}

export default MyPage