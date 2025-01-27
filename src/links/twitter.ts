import { preprocessMatches } from "@/ppixiv"
import { genLinks } from "."
import { memoize } from "./memo"

const URL_REGEX = /URL=(.+?)"/

const extractUrl = memoize(async (url: string) => {
	return GM.xmlHttpRequest({
		method: "GET",
		url,
	})
		.then((r) => r.responseText.match(URL_REGEX)![1])
		.catch(console.error)
})

export async function twitter(
	link: UserLink,
	newLinks: UserLink[],
	userId: number,
) {
	extractUrl(
		(url) => {
			if (!url) return
			genLinks(
				preprocessMatches([url]).filter((e) => e) as unknown as UserLink[],
				userId,
			).forEach((e) => newLinks.push(e))
		},
		userId,
		link.url.toString(),
	)
}
