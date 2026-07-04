import { CreatorData, PostData } from "./index"

export interface PawchiveCreator {
	id: string
	name: string
	service: string
	indexed: string
	updated: string
	public_id: string
	relation_id: null
}

export function toApiUrl(u: string) {
	const url = new URL(u)
	url.pathname = `/api/v1${url.pathname.replace(/\/$/, "")}/profile`

	return url.toString()
}

export async function getCreatorData(u: string): Promise<CreatorData> {
	const url = toApiUrl(u)
	const response = await GM.xmlHttpRequest({
		url,
		headers: { Accept: "text/css" },
		timeout: 5000
	})
	switch (response.status) {
		case 200: {
			const data: PawchiveCreator = JSON.parse(response.responseText)
			return {
				lastUpdate: data.updated.split("T")[0],
			}
		}
		case 0:
			throw new Error("Timeout")
		default:
			throw new Error(`${response.status}`)
	}
}

export function getPostData(u: string): Promise<PostData> {
	return getCreatorData(u)
}
