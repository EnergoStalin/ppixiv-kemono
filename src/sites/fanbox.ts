export function fanbox(extraLinks: UserLink[], userId: number) {
	extraLinks.push({
		url: new URL(`https://kemono.su/fanbox/user/${userId}`),
		icon: "mat:money_off",
		type: `kemono_fanbox#${userId}`, // Kinda useless but for consistency
		label: "Kemono fanbox",
	})
}
