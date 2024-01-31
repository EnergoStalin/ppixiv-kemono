export function fanbox(extraLinks: UserLink[], userInfo: User) {
	extraLinks.push({
		url: new URL(`https://kemono.su/fanbox/user/${userInfo.userId}`),
		icon: "mat:money_off",
		type: "kemono_fanbox",
		label: "Kemono fanbox",
	})
}
