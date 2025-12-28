import { getDetail } from "@/lib/open-api/tmdb-server"
import CardInfo from "@/components/contents/card-info";
import ImageCard from "@/components/contents/image-card";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "수상"
}

const AWARDS = [
  {
    title: "작품상",
    id: 1064213,
    desc: "",
    nomis: ["브루탈리스트", "컴플리트 언노운", "콘클라베", "듄: 파트2", "에밀리아 페레즈", "아임 스틸 히어", "니클의 소년들", "서브스턴스", "위키드"]
  }, {
    title: "감독상",
    id: 1064213,
    desc: "션 베이커",
    nomis: ["브루탈리스트", "컴플리트 언노운", "에밀리아 페레즈", "서브스턴스"]
  }, {
    title: "여우주연상",
    id: 1064213,
    desc: "마이키 매디슨",
    nomis: ["신시아 에리보", "카를라 소피아 가스콘", "데미 무어", "페르난다 토히스"]
  }, {
    title: "남우주연상",
    id: 549509,
    desc: "에이드리언 브로디",
    nomis: ["티모시 샬라메", "콜먼 도밍고", "레이프 파인스", "세바스찬 스탠"]
  }, {
    title: "여우조연상",
    id: 974950,
    desc: "조이 샐다냐",
    nomis: ["모니카 바바로", "아리아나 그란데", "펄리시티 존스", "이사벨라 로셀리니"]
  }, {
    title: "남우조연상",
    id: 1013850,
    desc: "키에란 컬킨",
    nomis: ["유리 보리소프", "에드워드 노튼", "가이 피어스", "제레미 스트롱"]
  }, {
    title: "각본상",
    id: 1064213,
    desc: "션 베이커",
    nomis: ["브루탈리스트", "리얼 페인", "9월 5일: 위험한 특종", "서브스턴스"]
  }, {
    title: "각색상",
    id: 974576,
    desc: "",
    nomis: ["컴플리트 언노운", "에밀리아 페레즈", "니클의 소년들", "씽씽"]
  }, {
    title: "음악상",
    id: 549509,
    desc: "대니얼 블럼버그",
    nomis: ["콘클라베", "에밀리아 페레즈", "위키드", "와일드 로봇"]
  }, {
    title: "주제가상",
    id: 974950,
    desc: "<El Mal>",
    nomis: ["6888 중앙우편대대", "씽씽", "엘튼 존: 네버 투 레이트"]
  }, {
    title: "미술상",
    id: 402431,
    desc: "네이선 크롤리",
    nomis: ["브루탈리스트", "콘클라베", "듄: 파트 2", "노스페라투"]
  }, {
    title: "분장상",
    id: 933260,
    desc: "",
    nomis: ["어 디프런트 맨", "에밀리아 페레즈", "노스페라투", "위키드"]
  }, {
    title: "의상상",
    id: 402431,
    desc: "폴 타즈웰",
    nomis: ["컴플리트 언노운", "콘클라베", "글래디에이터 II", "노스페라투"]
  }, {
    title: "촬영상",
    id: 549509,
    desc: "롤 크롤리",
    nomis: ["듄: 파트 2", "에밀리아 페레즈", "마리아", "노스페라투"]
  }, {
    title: "편집상",
    id: 1064213,
    desc: "션 베이커",
    nomis: ["브루탈리스트", "콘클라베", "에밀리아 페레즈", "위키드"]
  }, {
    title: "시각효과상",
    id: 693134,
    desc: "",
    nomis: ["에이리언: 로물루스", "베러맨", "혹성탈출: 새로운 시대", "위키드"]
  }, {
    title: "음향상",
    id: 693134,
    desc: "",
    nomis: ["컴플리트 언노운", "에밀리아 페리즈", "위키드", "와일드 로봇"]
  }, {
    title: "장편 애니메이션상",
    id: 823219,
    desc: "",
    nomis: ["인사이드 아웃 2", "달팽이의 회고록", "월레스와 그로밋: 복수의 날개", "와일드 로봇"]
  }, {
    title: "장편 국제영화상",
    id: 1000837,
    desc: "",
    nomis: ["바늘을 든 소녀", "에밀리아 페레즈", "신성한 나무의 씨앗", "플로우"]
  },
] as const;

const SectionTitle = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 my-6">
    {/* <span className="h-4 w-1 rounded bg-gray-600" /> */}
    <div className="h-px flex-1 bg-gray-200" />
    <h2 className="text-sm font-semibold tracking-wide text-gray-600">
      {title}
    </h2>
    <div className="h-px flex-1 bg-gray-200" />
  </div>
);

const Page = async (params: any) => {
  const { id } = await params
  const results = await Promise.all(
    AWARDS.map(a => getDetail('movie', a.id))
  );

  return (
    <>
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          OSCARS
          <span className="ml-2 text-gray-400">2024</span>
        </h1>
        <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-gray-900" />
      </header>

      {AWARDS.map((award, index) => {
        const data = results[index];
        if (!data) return null;

        return (
          <section key={award.title}>
            <SectionTitle title={award.title} />
            <ImageCard content={data} desc={award.desc} />
            <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1">
              {award.nomis.map((nomi) => (
                <span
                  key={nomi}
                  className="
                    text-sm
                    text-gray-400
                    cursor-default
                    whitespace-nowrap
                  "
                >
                  {nomi}
                </span>
              ))}
            </div>
          </section>
        );
      })}
    </>
  )
}

export default Page