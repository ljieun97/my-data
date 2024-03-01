/** @type {import('next').NextConfig} */
const API_KEY = process.env.API_KEY_TMDB
const getToday = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = ('0' + (date.getMonth() + 1)).slice(-2)
  const day = ('0' + (date.getDate())).slice(-2)
  return `${year}-${month}-${day}`
}
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['tmdb.org', 'www.themoviedb.org'],
  },
  async rewrites() {
    const url = `https://api.themoviedb.org/3/discover/tv?air_date.gte=${getToday()}&air_date.lte=${getToday()}&language=ko&watch_region=KR&with_watch_providers=8|9|96|97|337|350|356&api_key=${API_KEY}`
    console.log(url)
    return [
      {
        source: "/api/tm-moives",
        destination: url
      }
    ]
  }
};

export default nextConfig;
