import { checkAvalibility } from "./avalibility"
import { genLinks } from "./links"

const addUserLinks: typeof unsafeWindow.vviewHooks.addUserLinks = ({
	extraLinks,
	userInfo,
}) => {
	const toBeChecked: UserLink[] = genLinks(extraLinks, userInfo.userId)
	const reachableLinks = checkAvalibility(toBeChecked, userInfo.userId)

	extraLinks.push(...reachableLinks)
}

unsafeWindow.vviewHooks = {
	addUserLinks,
}
