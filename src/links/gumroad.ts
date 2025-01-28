import { memoizedRegexRequest } from "./memo"
import { makeUrl } from "./url"

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

			extraLinks.push(makeUrl("kemono", "gumroad", id))
			extraLinks.push(makeUrl("nekohouse", "gumroad", id))
		},
		userId,
		link.url.toString(),
		GUMROAD_ID_REGEX,
	)
}
