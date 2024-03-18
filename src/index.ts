import { disableDeadLinks } from "./deadLinks"
import { getLinksFromDescription } from "./ppixiv"
import { fanbox } from "./sites/fanbox"
import { fantia } from "./sites/fantia"
import { patreon } from "./sites/parteon"

const addUserLinks: typeof unsafeWindow.vviewHooks.addUserLinks = ({
	extraLinks,
	userInfo,
}) => {
	const toBeChecked: UserLink[] = []
	for (const link of [...extraLinks, ...getLinksFromDescription(extraLinks)]) {
		switch (link.label) {
			case "Fanbox":
				fanbox(toBeChecked, userInfo.userId)
				break
			case "patreon.com":
				patreon(link, toBeChecked, userInfo.userId)
				break
			case "fantia.jp":
				fantia(link, toBeChecked)
				break
			default:
		}
	}

	const discoveredLinks = disableDeadLinks(toBeChecked, userInfo)

	extraLinks.push(...discoveredLinks)
}

unsafeWindow.vviewHooks = {
	addUserLinks,
}
