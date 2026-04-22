import PersonModal from "@/components/modal/person-modal";
import PersonDetailContent from "@/components/person/person-detail-content";
import { getPersonCredits, getPersonDetail } from "@/lib/open-api/tmdb-server";

export const metadata = {
  title: "Person",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [person, credits] = await Promise.all([getPersonDetail(id), getPersonCredits(id)]);

  return (
    <PersonModal>
      <PersonDetailContent person={person} credits={credits} />
    </PersonModal>
  );
}
