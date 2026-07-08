import { CreatorData, PostData } from "."
import { handleLastUpdateError } from "./common"

const CREATOR_LAST_UPDATE_TIME_REGEX = /datetime="(.+)?"/
const POST_LAST_UPDATE_TIME_REGEX = /datetime="(.+)?"/

const REQUEST_TIMEOUT = 5000

async function fetchPage(url: string, timeout: number): Promise<string> {
	const commonOptions = { url, timeout }
	let response: Tampermonkey.Response<any>
	let timeouted = false
	try {
		response = await GM.xmlHttpRequest({
			method: "HEAD",
			...commonOptions,
			context: { refetch: true },
			ontimeout: () => (timeouted = true),
		})

		if (response.finalUrl !== url)
			throw new Error(`creator does not exist ${url}`)

		switch (response.status) {
			case 200:
				return response.context?.refetch
					? (await GM.xmlHttpRequest({ method: "GET", ...commonOptions }))
							.responseText
					: response.responseText
			case 0:
				throw new Error("Timeout")
			default:
				throw new Error(`${response.status}`)
		}
	} catch (error) {
		if (timeouted) throw new Error("Timeout")
		throw error
	}
}

export async function getData(url: string, regex: RegExp) {
	const html = await fetchPage(url, REQUEST_TIMEOUT)
	const lastUpdate = html
		.match(regex)?.[1]
		?.split(" ")[0]

	return { lastUpdate: handleLastUpdateError(lastUpdate) }
}

export async function getCreatorData(url: string): Promise<CreatorData> {
	return await getData(url, CREATOR_LAST_UPDATE_TIME_REGEX)
}

export async function getPostData(url: string): Promise<PostData> {
	return await getData(url, POST_LAST_UPDATE_TIME_REGEX)
}
