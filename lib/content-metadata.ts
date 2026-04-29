type CountryLike = {
  iso_3166_1?: string | null;
  name?: string | null;
};

type NormalizedCountry = {
  code: string | null;
  name: string | null;
};

function normalizeCountryCode(value?: string | null) {
  return typeof value === "string" && value.trim() ? value.trim().toUpperCase() : null;
}

function normalizeCountryName(value?: string | null) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function extractCountryMetadata(content: any) {
  const productionCountries: NormalizedCountry[] = Array.isArray(content?.production_countries)
    ? content.production_countries
        .map((item: CountryLike) => ({
          code: normalizeCountryCode(item?.iso_3166_1),
          name: normalizeCountryName(item?.name),
        }))
        .filter((item: NormalizedCountry) => Boolean(item.code || item.name))
    : [];

  const originCountries = Array.isArray(content?.origin_country)
    ? content.origin_country.map((value: string) => normalizeCountryCode(value)).filter(Boolean)
    : [];

  const primaryCountryCode =
    productionCountries.find((item) => item.code)?.code ??
    originCountries[0] ??
    null;

  const primaryCountryName =
    productionCountries.find((item) => item.code === primaryCountryCode)?.name ??
    productionCountries[0]?.name ??
    null;

  return {
    primary_country_code: primaryCountryCode,
    primary_country_name: primaryCountryName,
    origin_country_codes: originCountries,
    production_countries: productionCountries,
  };
}
