import { memoize } from "@/utils"

const GUMROAD_ID_REGEX = /"external_id":"(\d+)"/
const ripGumroadId = memoize(async (link: string) => {
	return GM.xmlHttpRequest({
		method: "GET",
		url: link,
	}).then((e) => e.responseText.match(GUMROAD_ID_REGEX)?.[1] ?? "undefined")
})

export function gumroad(
	link: UserLink,
	extraLinks: UserLink[],
	userId: number,
) {
	ripGumroadId(
		(id) => {
			extraLinks.push({
				url: new URL(`https://kemono.su/gumroad/user/${id}`),
				icon: "mat:money_off",
				type: `kemono_gumroad#{id}`,
				label: `Kemono gumroad`,
			})
		},
		userId,
		link.url.toString(),
	)
}
