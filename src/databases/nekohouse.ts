import { CreatorData, PostData } from "."

const CREATOR_LAST_UPDATE_TIME_REGEX = /datetime="(.+)?"/
const POST_LAST_UPDATE_TIME_REGEX = /datetime="(.+)?"/

async function fetchPage(url: string): Promise<string> {
	const response = await GM.xmlHttpRequest({ method: "HEAD", url })
	if (response.finalUrl !== url)
		throw new Error(`creator does not exist ${url}`)

	switch (response.status) {
		case 404:
			throw new Error("404")
		case 200:
			return (await GM.xmlHttpRequest({ method: "GET", url })).responseText
		default:
			throw new Error(`${response.status}`)
	}
}

export async function getCreatorData(url: string): Promise<CreatorData> {
	const html = await fetchPage(url)

	return {
		lastUpdate: html
			.match(CREATOR_LAST_UPDATE_TIME_REGEX)?.[1]
			?.split(" ")[0],
	}
}

export async function getPostData(url: string): Promise<PostData> {
	const html = await fetchPage(url)

	return {
		lastUpdate: html.match(POST_LAST_UPDATE_TIME_REGEX)?.[1]?.split(" ")[0],
	}
}
