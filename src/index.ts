import { checkAvalibility } from "./avalibility"
import { genLinks } from "./links"
import { getLinksFromDescription } from "./ppixiv"

const addUserLinks: typeof unsafeWindow.vviewHooks.addUserLinks = ({
	extraLinks,
	userInfo,
}) => {
	const toBeChecked: UserLink[] = genLinks(
		[...extraLinks, ...getLinksFromDescription(extraLinks)],
		userInfo.userId,
	)
	const reachableLinks = checkAvalibility(toBeChecked, userInfo.userId)

	extraLinks.push(...reachableLinks)
}

unsafeWindow.vviewHooks = {
	addUserLinks,
}
