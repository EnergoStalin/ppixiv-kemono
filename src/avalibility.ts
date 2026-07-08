import { getCreatorData } from "./databases"
import { notifyUserUpdated } from "./ppixiv"

interface CachedRequest {
	error?: string
	lastUpdate?: string
}

function requestCacher(request: (url: string) => Promise<string>) {
	const pending: Set<string> = new Set()
	const cache: Record<string, CachedRequest> = {}

	function _request(url: string, after: () => void) {
		if (pending.has(url))
			return

		pending.add(url)

		request(url)
			.then((r) => (cache[url] = { lastUpdate: r }))
			.catch((e: Error) => (console.error(e), cache[url] = { error: `${e}` }))
			.finally(() => (pending.delete(url), after()))
	}

	return function(url: string, after: () => void) {
		const result = cache[url]
		if (result !== undefined) {
			if (result.error !== undefined) {
				_request(url, after)
			}
			return result
		}

		_request(url, after)

		return
	}
}

export function updateLink(link: UserLink, cache: Record<string, CachedRequest | undefined>) {
	const url = link.url.toString()
	const request = cache[url]
	if (request === undefined) {
		link.disabled = true
	} else if (request.error) {
		link.label += ` (${clampString(request.error, 15)})`
		link.disabled = true
	} else {
		link.label += ` (${request.lastUpdate})`
	}
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

const cache = requestCacher((url) => getCreatorData(url).then(e => e.lastUpdate))

export function updateAvalibility(links: UserLink[], userId: number) {
	const cached: Record<string, CachedRequest | undefined> = {}
	for (const link of links) {
		const url = link.url.toString()
		cached[url] = cache(url, () => notifyUserUpdated(userId))
		updateLink(link, cached)
	}

	return links
}
