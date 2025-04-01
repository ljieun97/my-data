import Title from "@/components/common/title"
import { InfiniteTable } from "@/components/infinite-table"

export const metadata = {
  title: "유저"
}

const rows = [
  {
    key: "1",
    name: "아이유",
    gender: "여",
    year: 1993,
    contents: [
      { "id": 152601, "title": "그녀", "src": "https://image.tmdb.org/t/p/original/thUJI82kWMxA2jtjLtPxDIj67tY.jpg", "movie": true, "liked": true },
      { "id": 12429, "title": "벼랑 위의 포뇨", "src": "https://image.tmdb.org/t/p/original/tGSuFBsqdXxIz3fTSBfsZU9FBMN.jpg", "movie": true, "liked": true },
      { "id": 545611, "title": "에브리씽 에브리웨어 올 앳 원스", "src": "https://image.tmdb.org/t/p/original/tGSuFBsqdXxIz3fTSBfsZU9FBMN.jpg", "movie": true, "liked": true },
      { "id": 862, "title": "토이 스토리", "src": "https://image.tmdb.org/t/p/original/tGSuFBsqdXxIz3fTSBfsZU9FBMN.jpg", "movie": true, "liked": true },
      { "id": 391713, "title": "레이디 버드", "src": "https://image.tmdb.org/t/p/original/tGSuFBsqdXxIz3fTSBfsZU9FBMN.jpg", "movie": true, "liked": true },
      { "id": 530915, "title": "1917", "src": "https://image.tmdb.org/t/p/original/tGSuFBsqdXxIz3fTSBfsZU9FBMN.jpg", "movie": true, "liked": true },

      { "id": 136283, "title": "더 글로리", "src": "https://image.tmdb.org/t/p/original/tGSuFBsqdXxIz3fTSBfsZU9FBMN.jpg", "movie": false, "liked": true }
    ]
  }
]

const columns = [
  {
    key: "name",
    label: "프로필",
  },
  {
    key: "movie",
    label: "추천영화",
  },
  {
    key: "tv",
    label: "추천시리즈",
  },
  {
    key: "contents",
    label: "총",
  },
];

const Page = () => {
  return (
    <>
      <Title title="" sub="" />
      <InfiniteTable columns={columns} rows={rows} />
    </>
  )
}

export default Page
