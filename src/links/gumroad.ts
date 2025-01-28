import { memoizedRegexRequest } from "./memo"
import { makeUrls } from "./url"

const GUMROAD_ID_REGEX = /"external_id":"(\d+)"/

export function gumroad(
	link: UserLink,
	extraLinks: UserLink[],
	userId: number,
) {
	memoizedRegexRequest(
		(id) => {
			if (!id) {
				link.disabled = true
				return
			}

			makeUrls(extraLinks, "gumroad", id)
		},
		userId,
		link.url.toString(),
		GUMROAD_ID_REGEX,
	)
}
