import TopBar from "@/components/layout/top-bar";
import TreeMenu from "@/components/layout/tree-menu";
import TaskBar from "@/components/layout/task-bar";
import styles from "@/styles/layout.module.css"
import "@/styles/global.css";

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
          <div className={styles.task_bar}>
            <TaskBar />
          </div>
        </div>
      </body>
    </html>
  );
}