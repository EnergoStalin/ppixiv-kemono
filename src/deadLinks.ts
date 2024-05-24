import { notifyUserUpdated } from "./ppixiv"

function fastHash(str: string) {
	let hash = 0
	if (str.length === 0) return hash
	for (let i = 0; i < str.length; i++) {
		hash += str.charCodeAt(i)
	}
	return hash
}

const cachedRedirects = {}
async function cacheRedirect(url: string) {
	const response = await GM.xmlHttpRequest({
		method: "GET",
		redirect: "manual",
		url,
	})
	const value = response.finalUrl !== url
	cachedRedirects[url] = value
}

const pending = new Set()
export function disableDeadLinks(links: UserLink[], userInfo: User) {
	const hash = fastHash(JSON.stringify(links))

	if (!pending.has(hash)) {
		pending.add(hash)

		Promise.all(
			links
				.filter((e) => cachedRedirects[e.url.toString()] === undefined)
				.map((e) => cacheRedirect(e.url.toString())),
		)
			.then((e) => {
				pending.delete(hash)
				if (e.length > 0) {
					notifyUserUpdated(userInfo.userId)
				}
			})
			.catch(console.error)
	}

	for (const l of links) {
		l.disabled = true
		if (cachedRedirects[l.url.toString()] === true) {
			l.label += " (Redirected)"
		} else {
			delete l.disabled
		}
	}

	return links
}
