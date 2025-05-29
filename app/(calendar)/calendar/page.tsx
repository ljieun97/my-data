import CalendarView from "@/components/calendar-view";
import Title from "@/components/common/title";
import { fetchAllMovies } from '@/lib/themoviedb/tmdb-server';
import puppeteer from 'puppeteer';

export default async function Page() {
  const option = {
    initialView: "dayGridMonth"
  }
  //------------------------------------------api
  const [upcoming, nowPlaying] = await Promise.all([
    fetchAllMovies('upcoming'),
    fetchAllMovies('now_playing'),
  ])
  const merged = [...upcoming, ...nowPlaying]
  const uniqueMoviesMap = new Map<number, typeof merged[0]>();
  merged.forEach(movie => {
    uniqueMoviesMap.set(movie.id, movie);
  });
  const uniqueMovies = Array.from(uniqueMoviesMap.values());

  //------------------------------------------크롤링
  // const browser = await puppeteer.launch({ headless: "new" as any });
  // const page = await browser.newPage();
  // await page.goto('https://www.rottentomatoes.com/browse/movies_in_theaters', {
  //   waitUntil: 'networkidle2',
  // });

  // const crawlings = await page.evaluate(() => {
  //   const items: {
  //     title: string;
  //     releaseDate: string;
  //     poster: string;
  //     criticScore: string;
  //     audienceScore: string;
  //     link: string;
  //   }[] = [];

  //   document.querySelectorAll('.js-tile-link').forEach(el => {
  //     const title = el.querySelector('[data-qa="discovery-media-list-item-title"]')?.textContent?.trim() || '';
  //     const releaseDate = el.querySelector('[data-qa="discovery-media-list-item-start-date"]')?.textContent?.trim() || '';
  //     const poster = el.querySelector('rt-img')?.getAttribute('src') || '';
  //     const criticScore = el.querySelector('rt-text[slot="criticsScore"]')?.textContent?.trim() || '- -';
  //     const audienceScore = el.querySelector('rt-text[slot="audienceScore"]')?.textContent?.trim() || '- -';
  //     const linkPath = el.querySelector('a[slot="caption"]')?.getAttribute('href') || '';
  //     const link = `https://www.rottentomatoes.com${linkPath}`;

  //     items.push({ title, releaseDate, poster, criticScore, audienceScore, link });
  //   });

  //   return items;
  // });

  // await browser.close();

  // console.log(uniqueMovies.length, crawlings.length)



  return (
    // <div className="flex flex-col md:flex-row">
    <>
      <div className="w-full h-full" >
        <CalendarView results={uniqueMovies} option={option} />
      </div>
    </>
    // </div>
  );
}
