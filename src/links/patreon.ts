import { memoizedRegexRequest } from "./memo"
import { makeUrls, normalizeUrl } from "./url"

function normalizePatreonLink(link: UserLink) {
	if (typeof link.url === "string") link.url = normalizeUrl(link.url)

	link.url.protocol = "https"
	let host = link.url.host

	if (!host.startsWith("www.")) host = `www.${host}`
	if (!host.endsWith(".com")) host = `${host.replace(/.$/m, "")}.com`

	link.url.host = host
}

const PATREON_ID_REGEXES = [
	/"creator":{"data":{"id":"(\d+)"/s,
	/https:\/\/www\.patreon\.com\/api\/user\/(\d+)/s,
]

export function patreon(
	link: UserLink,
	extraLinks: UserLink[],
	userId: number,
) {
	normalizePatreonLink(link)
	const url = link.url.toString()

	memoizedRegexRequest(
		(id) => {
			if (id === "undefined") {
				link.disabled = true
				return
			}

			makeUrls(extraLinks, "patreon", id)
		},
		userId,
		url,
		PATREON_ID_REGEXES,
	)
}
