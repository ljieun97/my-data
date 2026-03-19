'use client'

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import { useRouter } from "next/navigation";
import AwardCell from "./awards-cell";

const AWARDS = [
  {
    year: 2025,
    col1: "",
    col2: "",
    col3: 1456349,
  },
  {
    year: 2024,
    col1: 1064213,
    col2: 1064213,
    col3: 1064213,
  },
]

export default function AwardsTable() {
  const router = useRouter()

  return <>
    <div className="content-panel">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="page-title text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">Awards</h1>
          <p className="page-subtitle mt-1 text-sm">Major awards by year.</p>
        </div>
        <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white" onClick={() => router.push('/awards/oscar')}>
          2024 Oscar
        </button>
      </div>

      <Table aria-label="Awards table" classNames={{ wrapper: "rounded-[24px] border border-slate-200/80 bg-white/82 p-2 shadow-[0_16px_40px_rgba(15,23,42,0.06)]" }}>
        <TableHeader>
          <TableColumn className="w-1/4">Year</TableColumn>
          <TableColumn className="w-1/4">Critics</TableColumn>
          <TableColumn className="w-1/4">Academy</TableColumn>
          <TableColumn className="w-1/4">Cannes</TableColumn>
        </TableHeader>
        <TableBody>
          {AWARDS.map((award) => (
            <TableRow key={award.year}>
              <TableCell>{award.year}</TableCell>
              <TableCell>
                <AwardCell id={award.col1} />
              </TableCell>
              <TableCell>
                <AwardCell id={award.col2} />
              </TableCell>
              <TableCell>
                <AwardCell id={award.col3} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </>
}
