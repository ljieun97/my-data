import PersonDetailContent from "@/components/person/person-detail-content";
import { getPersonCredits, getPersonDetail } from "@/lib/open-api/tmdb-server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = await getPersonDetail(id);

  return {
    title: person?.name ? `${person.name} | Person` : "Person",
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [person, credits] = await Promise.all([getPersonDetail(id), getPersonCredits(id)]);

  return <PersonDetailContent person={person} credits={credits} />;
}
