import { CreatorData, PostData } from "."

const CREATOR_LAST_UPDATE_TIME_REGEX = /datetime="(.+)?"/
const POST_LAST_UPDATE_TIME_REGEX = /datetime="(.+)?"/

async function fetchPage(url: string): Promise<string> {
	const response = await GM.xmlHttpRequest({ method: "GET", url })
	if (response.finalUrl !== url)
		throw new Error(`creator does not exists ${url}`)

	return response.responseText
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