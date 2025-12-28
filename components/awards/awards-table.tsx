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
    <button onClick={() => router.push('/awards/oscar')}>2024오스카</button>

    <Table aria-label="Example static collection table">
      <TableHeader>
        <TableColumn>연도</TableColumn>
        <TableColumn>크리틱스(1월)</TableColumn>
        <TableColumn>아카데미(3월)</TableColumn>
        <TableColumn>칸(5월)</TableColumn>
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
  </>
}