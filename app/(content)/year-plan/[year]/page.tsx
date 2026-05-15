import { notFound } from "next/navigation";
import YearPlanDetailPage from "@/components/year-plan/year-plan-detail-page";
import { getYearPlanByYear } from "@/lib/year-plan";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const numericYear = Number(year);
  const plan = Number.isFinite(numericYear) ? await getYearPlanByYear(numericYear) : null;

  return {
    title: plan ? plan.title : "Year Plan",
  };
}

export default async function YearPlanPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const numericYear = Number(year);

  if (!Number.isFinite(numericYear)) {
    notFound();
  }

  const plan = await getYearPlanByYear(numericYear);

  if (!plan) {
    notFound();
  }

  return <YearPlanDetailPage plan={plan} />;
}
