import { memoizedRegexRequest } from "./memo"
import { makeUrls, normalizeUrl } from "./url"

function normalizePatreonLink(link: UserLink) {
	if (typeof link.url === "string") link.url = new URL(normalizeUrl(link.url))

	link.url.protocol = "https"
	if (!link.url.host.startsWith("www.")) link.url.host = `www.${link.url.host}`
}

const PATREON_ID_REGEX = /"creator":{"data":{"id":"(\d+)"/s

export function patreon(
	link: UserLink,
	extraLinks: UserLink[],
	userId: number,
) {
	normalizePatreonLink(link)
	const url = link.url.toString()

	memoizedRegexRequest(
		(id) => {
			if (!id) {
				link.disabled = true
				return
			}

			makeUrls(extraLinks, "patreon", id)
		},
		userId,
		url,
		PATREON_ID_REGEX,
	)
}
