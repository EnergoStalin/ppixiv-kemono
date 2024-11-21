import { makeUrl } from "./url"

export function fanbox(extraLinks: UserLink[], userId: number) {
	extraLinks.push(makeUrl("kemono", "fanbox", userId))
	extraLinks.push(makeUrl("nekohouse", "fanbox", userId))
}
