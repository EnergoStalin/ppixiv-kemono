import { getCreatorData, KemonoCreator, lastPostTimeFromHtml } from "./kemono"
import { notifyUserUpdated } from "./ppixiv"

function fastHash(str: string) {
	let hash = 0
	if (str.length === 0) return hash
	for (let i = 0; i < str.length; i++) {
		hash += str.charCodeAt(i)
	}
	return hash
}

interface CachedRequest {
	redirected: boolean
	lastUpdate?: string
}

const cachedRequests: Record<string, CachedRequest> = {}
async function cacheRequest(url: string) {
	try {
		const data = await getCreatorData(url)
		cachedRequests[url] = {
			redirected: false,
			lastUpdate: data.updated.split("T")[0],
		}
	} catch {
		cachedRequests[url] = {
			redirected: true,
		}
	}
}

const pending = new Set()
export function postprocessLinks(links: UserLink[], userInfo: User) {
	const hash = fastHash(JSON.stringify(links))

	if (!pending.has(hash)) {
		pending.add(hash)

		Promise.all(
			links
				.filter((e) => cachedRequests[e.url.toString()] === undefined)
				.map((e) => cacheRequest(e.url.toString())),
		)
			.then((e) => {
				pending.delete(hash)
				if (e.length > 0) {
					notifyUserUpdated(userInfo.userId)
				}
			})
			.catch(console.error)
	}

	for (const l of links) {
		const request = cachedRequests[l.url.toString()]
		if (request?.redirected === true) {
			l.label += " (Redirected)"
			l.disabled = true
		} else if (request === undefined) {
			l.disabled = true
		} else {
			l.label += ` (${request.lastUpdate})`
		}
	}

	return links
}
