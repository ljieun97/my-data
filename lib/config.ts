const baseUrl =
process.env.NODE_ENV === "production"
  ? "https://today-movie.vercel.app"
  : "http://localhost:3000";

export const deployUrl = baseUrl
// export const deployUrl = "https://today-movie.vercel.app"