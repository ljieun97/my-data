import Movie from "../movie/page";

import type { AppProps } from 'next/app';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | 나빅",
};

export default function Home({ Component, pageProps }: AppProps) {
  return (
    <Movie />
  )
}