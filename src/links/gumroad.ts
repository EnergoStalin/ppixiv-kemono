import { memoize } from "./memo"
import { makeUrl } from "./url"

const GUMROAD_ID_REGEX = /"external_id":"(\d+)"/
const ripGumroadId = memoize(async (link: string) => {
	return GM.xmlHttpRequest({
		method: "GET",
		timeout: 5000,
		url: link,
	})
		.then((e) => e.responseText.match(GUMROAD_ID_REGEX)?.[1] ?? "undefined")
		.catch(console.error)
})

export function gumroad(
	link: UserLink,
	extraLinks: UserLink[],
	userId: number,
) {
	ripGumroadId(
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
	)
}
