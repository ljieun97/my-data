'use client'

import MyContents from "@/components/contents/my-contents"
import { Card, CardBody, Tab, Tabs } from "@nextui-org/react"
import MyLikes from "./my-likes"
import { useEffect, useState } from "react"
import { GetMovieCount } from "@/lib/mongo/movie"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faList, faBorderAll } from "@fortawesome/free-solid-svg-icons"

const MyPage = () => {
  const [contentCounts, setContentCounts] = useState([])

  useEffect(() => {
    (async () => {
      setContentCounts(await GetMovieCount())
    })()
  }, [])

  return (
    <>
      <Card>
        <CardBody>
          <div className="flex gap-3 items-center" >
            {contentCounts?.map((contentCount: any, index: number) => (
              <div className="flex gap-1" key={index}>
                <p className="text-small">{contentCount._id}</p>
                <p className="font-semibold text-small">{contentCount.count}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Tabs aria-label="Tabs" className="pt-4">
        <Tab
          key="rating"
          title={
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faList} />
              <span>리스트</span>
            </div>
          }
        >
          <MyContents />
        </Tab>
        <Tab
          key="like"
          title={
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faBorderAll} />
              <span>갤러리</span>
            </div>
          }
        >
          <MyLikes />
        </Tab>
      </Tabs>
    </>
  )
}

export default MyPage