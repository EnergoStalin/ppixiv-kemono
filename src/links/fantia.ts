import { makeUrls } from "./url"

export function fantia(link: UserLink, extraLinks: UserLink[]) {
	const id = link.url.toString().split("/").pop()

	makeUrls(extraLinks, "fantia", id)
}
