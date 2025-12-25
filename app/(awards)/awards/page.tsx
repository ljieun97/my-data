import { getDetail } from "@/lib/open-api/tmdb-server"
import CardInfo from "@/components/contents/card-info";
import ImageCard from "@/components/contents/image-card";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "수상"
}

const AWARDS = [
  {
    title: "테스트",
    type: "movie",
    id: 76600,
    desc: "",
  },
  {
    title: "작품상",
    type: "movie",
    id: 1064213,
    desc: "",
  },
  {
    title: "감독상",
    type: "movie",
    id: 1064213,
    desc: "션 베이커",
  },
  {
    title: "여우주연상",
    type: "movie",
    id: 1064213,
    desc: "마이키 매디슨",
  },
] as const;

const SectionTitle = ({ title }: { title: string }) => (
  <div className="flex items-center gap-4 my-6">
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
              <ImageCard content={data} desc={award.desc}/>
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