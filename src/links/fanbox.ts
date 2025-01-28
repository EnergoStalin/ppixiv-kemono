import { memoizedRegexRequest } from "./memo"
import { makeUrl } from "./url"

export function fanbox(link: UserLink, extraLinks: UserLink[], userId: number) {
	memoizedRegexRequest(
		(id) => {
			extraLinks.push(makeUrl("kemono", "fanbox", id))
			extraLinks.push(makeUrl("nekohouse", "fanbox", id))
		},
		userId,
		link.url.toString(),
		/fanbox\/public\/images\/creator\/([0-9]+)\/cover/,
	)
}
