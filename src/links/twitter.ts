import { preprocessMatches } from "@/ppixiv"
import { genLinks } from "."
import { memoizedRegexRequest } from "./memo"

const URL_REGEX = /URL=(.+?)"/

export async function twitter(
	link: UserLink,
	newLinks: UserLink[],
	userId: number,
) {
	let u = link.url.toString()

	if (u.includes("twitter") && !u.includes(".com"))
		u = u.replace("twitter", "twitter.com")

	link.url = u

	memoizedRegexRequest(
		(url: string | undefined) => {
			if (!url) return
			genLinks(
				preprocessMatches([url]).filter((e) => e) as unknown as UserLink[],
				userId,
			).forEach((e) => newLinks.push(e))
		},
		userId,
		u,
		[URL_REGEX],
	)
}
