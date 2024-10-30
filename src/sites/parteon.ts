import { memoize, normalizeUrl } from "../utils"

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

			extraLinks.push({
				url: new URL(`https://kemono.su/patreon/user/${cachedId}`),
				icon: "mat:money_off",
				type: `kemono_patreon#${cachedId}`,
				label: `Kemono patreon`,
			})
		},
		userId,
		url,
	)
}
