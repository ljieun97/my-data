/** @type {import('next').NextConfig} */
const API_KEY = process.env.API_KEY_TMDB
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['tmdb.org', 'www.themoviedb.org'],
  },

  //외부 api말고 내부 api중에 url에 보안이 필요할때 사용하기
  async rewrites() {
    return [
      {
        source: "/api/naver/:path*",
        destination: "https://openapi.naver.com/:path*",
      },
      {
        source: "/api/tm-movie/detail/:id",
        destination: `https://api.themoviedb.org/3/movie/:id?language=ko&api_key=${API_KEY}`
      }
    ]
  }
};

export default nextConfig;
