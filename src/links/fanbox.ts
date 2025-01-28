import { memoizedRegexRequest } from "./memo"
import { makeUrl } from "./url"

export function fanbox(link: UserLink, extraLinks: UserLink[], userId: number) {
	const url = new URL(link.url)
	url.pathname = ""

	memoizedRegexRequest(
		(id) => {
			const cid = id === "undefined" ? userId : id
			extraLinks.push(makeUrl("kemono", "fanbox", cid))
			extraLinks.push(makeUrl("nekohouse", "fanbox", cid))
		},
		userId,
		url.toString(),
		/fanbox\/public\/images\/creator\/([0-9]+)\/cover/,
	)
}
