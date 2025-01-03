import { getCreatorData } from "./databases"
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
	error?: string
	lastUpdate?: string
}

const cachedRequests: Record<string, CachedRequest> = {}
async function cacheRequest(url: string) {
	try {
		const data = await getCreatorData(url)
		cachedRequests[url] = {
			lastUpdate: data.lastUpdate,
		}
	} catch (error) {
		console.error(error)
		cachedRequests[url] = {
			error: `${error}`,
		}
	}
}

const pending = new Set()
export function checkAvalibility(links: UserLink[], userId: number) {
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
					notifyUserUpdated(userId)
				}
			})
			.catch(console.error)
	}

	for (const l of links) {
		const request = cachedRequests[l.url.toString()]
		if (request === undefined) {
			l.disabled = true
		} else if (request.error) {
			l.label += ` (${request.error})`
			l.disabled = true
		} else {
			l.label += ` (${request.lastUpdate})`
		}
	}

	return links
}
