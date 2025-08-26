import { memoize } from "./memo"
import { makeUrls } from "./url"

const fanboxId = memoize(async (creatorId: string) => {
	return GM.xmlHttpRequest({
		url: `https://api.fanbox.cc/creator.get?creatorId=${creatorId}`,
		headers: {
			Origin: "https://fanbox.cc",
		},
	})
		.then((r) => JSON.parse(r.responseText).body.user.userId)
		.catch(console.error)
})

function makeFanboxUrls(extraLinks: UserLink[], id: number | string) {
	makeUrls(extraLinks, "fanbox", id)
}

export function fanbox(link: UserLink, extraLinks: UserLink[], userId: number) {
	const url = new URL(link.url)

	if (url.host.includes("pixiv.net")) {
		makeFanboxUrls(extraLinks, url.pathname.split('/').pop() ?? "0")
	} else {
		let creatorId = url.host.split(".").shift()
		if (creatorId && (creatorId === "fanbox" || creatorId === "www")) {
			creatorId = url.pathname.replace(/^[/@]*/, "")
			if (creatorId.length === 0) return
		}
		fanboxId((id) => makeUrls(extraLinks, "fanbox", id), userId, creatorId)
	}
}
