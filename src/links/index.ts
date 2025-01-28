import { fanbox } from "./fanbox"
import { fantia } from "./fantia"
import { gumroad } from "./gumroad"
import { patreon } from "./patreon"
import { twitter } from "./twitter"

export function genLinks(extraLinks: UserLink[], userId: number): UserLink[] {
	const newLinks = []
	for (const link of extraLinks) {
		switch (link.label) {
			case "Fanbox":
				fanbox(link, newLinks, userId)
				break
			case "patreon.com":
				patreon(link, newLinks, userId)
				break
			case "gumroad.com":
				gumroad(link, newLinks, userId)
				break
			case "fantia.jp":
				fantia(link, newLinks)
				break
			case "t.co":
				twitter(link, newLinks, userId)
				break
			default:
		}
	}
	return newLinks
}
