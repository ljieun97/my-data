/** @type {import('next').NextConfig} */
import dayjs from 'dayjs'
const API_KEY = process.env.API_KEY_TMDB
const today = dayjs().format('YYYY-MM-DD')
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['tmdb.org', 'www.themoviedb.org'],
  },
  async rewrites() {
    return [
      {
        source: "/api/tm-todays",
         //3구글 8넷플릭스 9아마존 96네이버 97왓챠 337디즈니 350애플 356웨이브
        destination: `https://api.themoviedb.org/3/discover/tv?air_date.gte=${today}&air_date.lte=${today}&language=ko&watch_region=KR&with_watch_providers=8|9|96|97|337|350|356&api_key=${API_KEY}`,
      },
      {
        source: "/api/tm-series/:id",
        destination: `https://api.themoviedb.org/3/tv/:id/watch/providers?api_key=${API_KEY}`
      },
      {
        source: "/api/tm-movie/:id",
        destination: `https://api.themoviedb.org/3/movie/:id/watch/providers?api_key=${API_KEY}`
      },
      {
        source: "/api/tm-search/:id",
        destination: `https://api.themoviedb.org/3/search/multi?query=:id&language=ko&page=1&api_key=${API_KEY}`
      }
    ]
  }
};

export default nextConfig;
