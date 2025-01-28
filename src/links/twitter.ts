import { preprocessMatches } from "@/ppixiv"
import { genLinks } from "."
import { memoizedRegexRequest } from "./memo"

const URL_REGEX = /URL=(.+?)"/

export async function twitter(
	link: UserLink,
	newLinks: UserLink[],
	userId: number,
) {
	memoizedRegexRequest(
		(url) => {
			if (!url) return
			genLinks(
				preprocessMatches([url]).filter((e) => e) as unknown as UserLink[],
				userId,
			).forEach((e) => newLinks.push(e))
		},
		userId,
		link.url.toString(),
		URL_REGEX,
	)
}
