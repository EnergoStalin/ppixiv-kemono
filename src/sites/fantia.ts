export function fantia(link: UserLink, extraLinks: UserLink[]) {
	const id = link.url.toString().split("/").pop()
	extraLinks.push({
		url: new URL(`https://kemono.su/fantia/user/${id}`),
		icon: "mat:money_off",
		type: "kemono_fantia",
		label: "Kemono fantia",
	})
}
