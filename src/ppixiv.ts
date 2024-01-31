import { normalizeUrl } from "./utils"

const BODY_LINK_REGEX = /[\W\s]((?:https?:\/\/)?(?:\w+[./].+){2,})/g

const labelMatchingMap = {
	patreon: "patreon.com",
	fanbox: "Fanbox",
	fantia: "fantia.jp",
}

function preprocessMatches(matches: string[]): (UserLink | undefined)[] {
	return matches.map((e) => {
		try {
			const url = new URL(normalizeUrl(e))
			return {
				label: labelMatchingMap[
					Object.keys(labelMatchingMap).filter((e) =>
						url.host.includes(e),
					)[0]!
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

	return removeDuplicates(
		preprocessMatches(
			// eslint-disable-next-line unicorn/prefer-dom-node-text-content
			Array.from(desc.innerText.matchAll(BODY_LINK_REGEX)).map((e) => e[1]!),
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
