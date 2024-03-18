import { notifyUserUpdated } from "../ppixiv"
import { normalizeUrl } from "../utils"

function normalizePatreonLink(link: UserLink) {
	if (typeof link.url === "string") link.url = new URL(normalizeUrl(link.url))

	link.url.protocol = "https"
	if (!link.url.host.startsWith("www.")) link.url.host = `www.${link.url.host}`
}

const PATREON_ID_REGEX = /"id":\s*"(\d+)",[\n\s]*"type":\s*"user"/ms
async function ripPatreonId(link: string) {
	const response = await GM.xmlHttpRequest({
		method: "GET",
		url: link,
	})
	return response.responseText.match(PATREON_ID_REGEX)![1]
}

const cachedPatreonUsers = {}
export function patreon(
	link: UserLink,
	extraLinks: UserLink[],
	userId: number,
) {
	normalizePatreonLink(link)
	const url = link.url.toString()
	const cachedId = cachedPatreonUsers[url]
	if (!cachedId) {
		ripPatreonId(url)
			.then((id) => {
				cachedPatreonUsers[url] = id
				notifyUserUpdated(userId)
			})
			.catch(console.error)
	} else {
		extraLinks.push({
			url: new URL(`https://kemono.su/patreon/user/${cachedId}`),
			icon: "mat:money_off",
			type: "kemono_patreon",
			label: "Kemono patreon",
		})
	}
}
