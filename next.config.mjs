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
        source: "/naver/:path*",
        destination: "https://openapi.naver.com/:path*",
      },
      // {
      //   source: "/tmdb/:path*",
      //   has: [
      //     {
      //       type: 'header',
      //       key: 'accept',
      //       value: 'application/json',
      //     },
      //     {
      //       type: 'header',
      //       key: 'Authorization',
      //       value: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ZjkwNjhiYjlhYzEwM2UxZmVmODZiYmMzMmU0MjdjZiIsInN1YiI6IjYzZmIwYTQwMzQ0YThlMDBlNmNlMDk2OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.GyhHdVATnofwAdYZ0-yV1uX30FqrTU_QGBJH3mcQNqQ`,
      //     },
      //   ],
      //   destination: "https://api.themoviedb.org/3/:path*",
      // }
    ]
  }
};

export default nextConfig;
