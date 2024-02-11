import TopBar from "@/components/layout/TopBar";
import TreeMenu from "@/components/layout/TreeMenu";
import TaskBar from "@/components/layout/TaskBar";
import Style from "@/app/page.module.css"
import "./globals.css";

import type { Metadata } from "next";
import "98.css";

export const metadata: Metadata = {
  title: {
    template: "%s | NABIC",
    default: "NABIC"
  },
  description: "서비스 설명",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div style={{ height: 'calc(100vh - 200px)', margin: '100px', background: '#c0c0c0' }}>
          <div style={{ height: '3%' }}><TopBar /></div>
          <div style={{ display: 'flex', height: '97%', padding: '10px' }}>
            <div style={{ width: '20%' }}><TreeMenu /></div>
            <div style={{ width: '80%' }}>{children}</div>
          </div>
          <div className={Style.task_bar}>
            <TaskBar />
          </div>
        </div>
      </body>
    </html>
  );
}