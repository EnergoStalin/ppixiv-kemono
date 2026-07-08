import {
	getCreatorData as getKemonoCreatorData,
	getPostData as getKemonoPostData,
} from "./kemono"
import {
	getCreatorData as getNekohouseCreatorData,
	getPostData as getNekohousePostData,
} from "./nekohouse"
import {
	getCreatorData as getPawchiveCreatorData,
	getPostData as getPawchivePostData,
} from "./pawchive"

export interface CreatorData {
	lastUpdate: string
}
export type PostData = CreatorData

export async function getCreatorData(url: string): Promise<CreatorData> {
	if (url.includes("kemono"))
		return url.includes("post")
			? getKemonoPostData(url)
			: getKemonoCreatorData(url)
	if (url.includes("nekohouse"))
		return url.includes("post")
			? getNekohousePostData(url)
			: getNekohouseCreatorData(url)
	if (url.includes("pawchive"))
		return url.includes("post")
			? getPawchiveCreatorData(url)
			: getPawchivePostData(url)

	throw new Error(`unknown url ${url}`)
}
