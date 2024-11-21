import { memoize } from "./memo"
import { makeUrl, normalizeUrl } from "./url"

function normalizePatreonLink(link: UserLink) {
	if (typeof link.url === "string") link.url = new URL(normalizeUrl(link.url))

	link.url.protocol = "https"
	if (!link.url.host.startsWith("www.")) link.url.host = `www.${link.url.host}`
}

const PATREON_ID_REGEX = /"id":\s*"(\d+)",[\n\s]*"type":\s*"user"/ms
const ripPatreonId = memoize(async (link: string) => {
	return GM.xmlHttpRequest({
		method: "GET",
		timeout: 5000,
		url: link,
	})
		.then((e) => e.responseText.match(PATREON_ID_REGEX)?.[1] ?? "undefined")
		.catch(console.error)
})

export function patreon(
	link: UserLink,
	extraLinks: UserLink[],
	userId: number,
) {
	normalizePatreonLink(link)
	const url = link.url.toString()

	ripPatreonId(
		(cachedId) => {
			if (!cachedId) {
				link.disabled = true
				return
			}

			extraLinks.push(makeUrl("kemono", "patreon", cachedId))
			extraLinks.push(makeUrl("nekohouse", "patreon", cachedId))
		},
		userId,
		url,
	)
}
