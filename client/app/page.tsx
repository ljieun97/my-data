import TaskBar from "@/components/layout/TaskBar";
import TopBar from "@/components/layout/TopBar";
import TreeView from "@/components/layout/TreeView";

import Style from "@/app/page.module.css"
import "98.css";

export default function Home() {
  return (
    <main>
      <div className="window" style={{height: '100%', margin: '100px', background: '#c0c0c0'}}>
        <div style={{height: '3%'}}><TopBar /></div>
        <div style={{display: 'flex', height: '97%', padding: '10px'}}>
          <div style={{width: '20%'}}><TreeView /></div>
        </div>
        <div className={Style.task_bar}>
          <TaskBar />
        </div>
      </div>
    </main>
  )
}