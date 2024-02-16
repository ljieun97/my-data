"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchInput from "../home/search-input";

export default function TreeMenu() {
	const path = usePathname()
	return (
		<fieldset>
			<SearchInput />
			<li>Intro</li>
			<li>
				<Link href="/">Home</Link> {path === "/" ? "!" : ""}
			</li>
			<li>
				<Link href="/movie">Movie</Link> {path === "/movie" ? "!" : ""}
			</li>
			<li>
				CSS
				<ul>
					<li>Selectors</li>
					<li>Specificity</li>
					<li>Properties</li>
				</ul>
			</li>
			<li>
				<details open>
					<summary>JavaScript</summary>
					<ul>
						<li>Avoid at all costs</li>
						<li>
							<details>
								<summary>Unless</summary>
								<ul>
									<li>Avoid</li>
									<li>
										<details>
											<summary>At</summary>
											<ul>
												<li>Avoid</li>
												<li>At</li>
												<li>All</li>
												<li>Cost</li>
											</ul>
										</details>
									</li>
									<li>All</li>
									<li>Cost</li>
								</ul>
							</details>
						</li>
					</ul>
				</details>
			</li>
			<li>HTML</li>
			<li>Special Thanks</li>
		</fieldset>
	)
}