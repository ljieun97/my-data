'use client'

import MyContents from "@/components/contents/my-contents"
import { Tab, Tabs } from "@nextui-org/react"
import MyLikes from "./my-likes"

const MyPage = () => {
  return (
    <>
      <Tabs aria-label="Tabs">
        <Tab key="rating" title="평가한 작품" >
          <MyContents />
        </Tab>
        <Tab key="like" title="찜한 작품" >
          <MyLikes />
        </Tab>
      </Tabs>
    </>
  )
}

export default MyPage