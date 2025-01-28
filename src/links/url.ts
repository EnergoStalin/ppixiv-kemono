function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

export type Site = "fantia" | "gumroad" | "fanbox" | "patreon"
export type Service = "kemono" | "nekohouse"
export function makeUrl(
	service: Service,
	site: Site,
	userId?: number | string,
	postId?: number | string,
) {
	const post = postId ? `/post/${postId}` : ""
	return {
		url: new URL(`https://${service}.su/${site}/user/${userId}/${post}`),
		icon: "mat:money_off",
		type: `${service}_${site}#${userId}`,
		label: `${capitalize(service)} ${site}`,
	}
}

export function makeUrls(
	array: UserLink[],
	site: Site,
	userId?: number | string,
	postId?: number | string,
) {
	array.push(
		makeUrl("kemono", site, userId, postId),
		makeUrl("nekohouse", site, userId, postId),
	)
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function normalizeUrl(url: string) {
	let normalized = url.trim()
	if (!normalized.startsWith("http")) normalized = `https://${normalized}`

	return normalized
}
