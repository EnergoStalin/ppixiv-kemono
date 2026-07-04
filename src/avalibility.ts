import { getCreatorData } from "./databases"
import { notifyUserUpdated } from "./ppixiv"

interface CachedRequest {
	error?: string
	lastUpdate?: string
}

const avalibilityInfo: Record<string, CachedRequest> = {}
const pendingRequests: Set<String> = new Set()
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
	const pending = links
		.map((e) => e.url.toString())
		.filter((url) => {
			const request = avalibilityInfo[url]
			return !pendingRequests.has(url) && (request === undefined || request.error !== undefined)
		})
		.map((url) => cacheRequest(url))

	Promise.all(pending)
		.then((e) => {
			if (e.length > 0) {
				notifyUserUpdated(userId)
			}
		})
		.catch(console.error)

	return updateLinks(links)
}
