export type AwardsSourceType = "official" | "wikipedia";

export type AwardEntry = {
  status: "winner" | "nominee";
  primary: string;
  details: string[];
  relation?: "by" | "for";
};

export type AwardCategory = {
  name: string;
  section?: string;
  entries: AwardEntry[];
};

export type AwardCeremony = {
  slug: string;
  name: string;
  ceremonyYear: number;
  country: string;
  sourceType: AwardsSourceType;
  sourceUrl: string;
  headline: string;
  subheadline?: string;
  categories: AwardCategory[];
};

export type AwardsSourceSummary = {
  slug: string;
  name: string;
  country: string;
  description: string;
  sourceType: AwardsSourceType;
  latestYear: number;
  sourceBaseUrl: string;
};
