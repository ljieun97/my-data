import TaskBar from "@/components/layout/TaskBar";
import TopBar from "@/components/layout/TopBar";
import TreeMenu from "@/components/layout/TreeMenu";

import Movie from "./movie/page";

import Style from "@/app/page.module.css"
import "98.css";

import type { AppProps } from 'next/app';

export default function Home({ Component, pageProps }: AppProps) {
  return (
    <>
      <div className="window" style={{height: '100%', margin: '100px', background: '#c0c0c0'}}>
        <div style={{height: '3%'}}><TopBar /></div>
        <div style={{display: 'flex', height: '97%', padding: '10px'}}>
          <div style={{width: '20%'}}><TreeMenu /></div>
          {/* <div style={{width: '80%'}}><Component {...pageProps} /></div> */}
          <div style={{width: '80%'}}><Movie /></div>
        </div>
        <div className={Style.task_bar}>
          <TaskBar />
        </div>
      </div>
    </>
  )
}