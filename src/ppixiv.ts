import { normalizeUrl } from "./links/url"

// eslint-disable-next-line no-useless-escape
const BODY_LINK_REGEX = /[\W\s]((?:https?:\/\/)?(?:\w+[\.\/])+(?:\w?)+)/g

const labelMatchingMap = {
	patreon: "patreon.com",
	fanbox: "Fanbox",
	fantia: "fantia.jp",
	gumroad: "gumroad.com",
	twitter: "t.co",
}

export function preprocessMatches(matches: string[]): (UserLink | undefined)[] {
	return matches.map((e) => {
		try {
			const url = new URL(normalizeUrl(e))
			return {
				label: labelMatchingMap[
					Object.entries(labelMatchingMap).find(
						([k, v]) => url.host.includes(v) || url.host.includes(k),
					)![0]
				],
				url,
			}
		} catch {}
		return undefined
	})
}

export function getLinksFromDescription(extraLinks: UserLink[]) {
	const desc = document.body.querySelector(".description")! as unknown as {
		innerText: string
	}

	// eslint-disable-next-line unicorn/prefer-dom-node-text-content
	const normalized = desc.innerText
		.replaceAll(/\/\s+/g, "/")
		.replaceAll("(dot)", ".")

	return removeDuplicates(
		preprocessMatches(
			Array.from(normalized.matchAll(BODY_LINK_REGEX)).map((e) => e[1]!),
		).filter((e) => e) as UserLink[],
		extraLinks,
	)
}

export function removeDuplicates(links: UserLink[], extraLinks: UserLink[]) {
	const labels = extraLinks.map((e) => e.label)
	return links.filter((e) => !labels.includes(e.label))
}

export function notifyUserUpdated(userId: number) {
	unsafeWindow.ppixiv.userCache.callUserModifiedCallbacks(userId)
}

export function notifyUserUpdatedForCurrentIllustration() {
	notifyUserUpdated(getMediaInfoForCurrentIllustration()?.userId)
}

export function getMediaInfoForCurrentIllustration() {
	return unsafeWindow.ppixiv.mediaCache._mediaInfo[
		unsafeWindow.ppixiv.app._screenIllust.currentMediaId
	]
}
