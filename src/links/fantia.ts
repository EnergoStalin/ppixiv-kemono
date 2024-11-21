import { makeUrl } from "./url"

export function fantia(link: UserLink, extraLinks: UserLink[]) {
	const id = link.url.toString().split("/").pop()

	extraLinks.push(makeUrl("kemono", "fantia", id))
	extraLinks.push(makeUrl("nekohouse", "fantia", id))
}
