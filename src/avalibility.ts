import { getCreatorData } from "./databases"
import { notifyUserUpdated } from "./ppixiv"

interface CachedRequest {
	error?: string
	lastUpdate?: string
}

const avalibilityInfo: Record<string, CachedRequest> = {}
const pendingRequests: Set<string> = new Set()
async function cacheRequest(url: string) {
	pendingRequests.add(url)
	try {
		const data = await getCreatorData(url)
		avalibilityInfo[url] = {
			lastUpdate: data.lastUpdate,
		}
	} catch (error) {
		avalibilityInfo[url] = {
			error: `${error}`,
		}
	} finally {
		pendingRequests.delete(url)
	}
}

export function updateLinks(links: UserLink[]) {
	for (const l of links) {
		const url = l.url.toString()
		const request = avalibilityInfo[url]
		if (request === undefined) {
			l.disabled = true
		} else if (request.error) {
			l.label += ` (${clampString(request.error, 15)})`
			l.disabled = true
		} else {
			l.label += ` (${request.lastUpdate})`
		}
	}

	return links
}

function clampString(s: string, max: number) {
	let end = s.length
	let postfix = ""

	if (s.length > max) {
		end = max - 3
		postfix = "..."
	}

	return s.slice(0, Math.max(0, end)) + postfix
}

export function updateAvalibility(links: UserLink[], userId: number) {
	for (const link of links) {
		const url = link.url.toString()
		const request = avalibilityInfo[url]
		if (pendingRequests.has(url) || (request && request.error === undefined)) {
			continue
		}

		cacheRequest(url).then(() => notifyUserUpdated(userId)).catch(console.error)
	}

	return updateLinks(links)
}
