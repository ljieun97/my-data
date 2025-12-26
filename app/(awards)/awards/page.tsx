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
    type: "movie",
    id: 1064213,
    desc: "",
  }, {
    title: "감독상",
    type: "movie",
    id: 1064213,
    desc: "션 베이커",
  }, {
    title: "여우주연상",
    type: "movie",
    id: 1064213,
    desc: "마이키 매디슨",
  }, {
    title: "남우주연상",
    type: "movie",
    id: 549509,
    desc: "에이드리언 브로디",
  }, {
    title: "여우조연상",
    type: "movie",
    id: 974950,
    desc: "조이 샐다냐",
  }, {
    title: "남우조연상",
    type: "movie",
    id: 1013850,
    desc: "키에란 컬킨",
  }, {
    title: "각본상",
    type: "movie",
    id: 1064213,
    desc: "션 베이커",
  }, {
    title: "각색상",
    type: "movie",
    id: 974576,
    desc: "",
  }, {
    title: "음악상",
    type: "movie",
    id: 549509,
    desc: "대니얼 블럼버그",
  }, {
    title: "주제가상",
    type: "movie",
    id: 974950,
    desc: "<El Mal>",
  }, {
    title: "미술상",
    type: "movie",
    id: 402431,
    desc: "네이선 크롤리",
  }, {
    title: "분장상",
    type: "movie",
    id: 933260,
    desc: "",
  }, {
    title: "의상상",
    type: "movie",
    id: 402431,
    desc: "폴 타즈웰",
  }, {
    title: "촬영상",
    type: "movie",
    id: 549509,
    desc: "롤 크롤리",
  }, {
    title: "편집상",
    type: "movie",
    id: 1064213,
    desc: "션 베이커",
  }, {
    title: "시각효과상",
    type: "movie",
    id: 693134,
    desc: "",
  }, {
    title: "음향상",
    type: "movie",
    id: 693134,
    desc: "",
  },{
    title: "장편 애니메이션상",
    type: "movie",
    id: 823219,
    desc: "",
  },{
    title: "장편 국제영화상",
    type: "movie",
    id: 1000837,
    desc: "",
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

const Page = async () => {
  const results = await Promise.all(
    AWARDS.map(a => getDetail(a.type, a.id))
  );


  return (
    <>
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          THE OSCARS
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

            {award.type === "movie" ? (
              <ImageCard content={data} desc={award.desc} />
            ) : (
              // <PersonCard person={data} />
              <>
              </>
            )}
          </section>
        );
      })}
    </>
  )
}

export default Page