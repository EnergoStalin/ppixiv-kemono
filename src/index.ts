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
				fanbox(toBeChecked, userInfo)
				break
			case "patreon.com":
				patreon(link, toBeChecked, userInfo)
				break
			case "fantia.jp":
				fantia(link, toBeChecked)
				break
			default:
		}
	}

	extraLinks.push(...disableDeadLinks(toBeChecked, userInfo))
}

unsafeWindow.vviewHooks = {
	addUserLinks,
}
