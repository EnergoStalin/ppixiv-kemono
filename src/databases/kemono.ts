import { CreatorData, PostData } from "./index"

export interface KemonoCreator {
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
	url.pathname = `/api/v1${url.pathname}/profile`

	return url.toString()
}

export async function getCreatorData(u: string): Promise<CreatorData> {
	const url = toApiUrl(u)
	const response = await GM.xmlHttpRequest({ url })
	if (response.status === 404) throw "Creator dont exists"

	const data: KemonoCreator = JSON.parse(response.responseText)
	return {
		lastUpdate: data.updated.split("T")[0],
	}
}

export function getPostData(u: string): Promise<PostData> {
	return getCreatorData(u)
}
