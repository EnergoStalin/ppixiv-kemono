import { CreatorData, PostData } from "."

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

export async function getCreatorData(url: string): Promise<CreatorData> {
	const html = await fetchPage(url, REQUEST_TIMEOUT)

	return {
		lastUpdate: html
			.match(CREATOR_LAST_UPDATE_TIME_REGEX)?.[1]
			?.split(" ")[0],
	}
}

export async function getPostData(url: string): Promise<PostData> {
	const html = await fetchPage(url, REQUEST_TIMEOUT)

	return {
		lastUpdate: html.match(POST_LAST_UPDATE_TIME_REGEX)?.[1]?.split(" ")[0],
	}
}
