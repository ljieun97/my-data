import BoxOffice from "@/components/box-office";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Home",
};

const Home = async () => {
  return (
    <>
      <BoxOffice results={[]} />
      {/* <MoodSelecter /> */}
    </>
  );
};

export default Home;
