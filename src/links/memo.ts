/* eslint-disable @typescript-eslint/no-explicit-any */
import { notifyUserUpdated } from "@/ppixiv"

type Awaitable = (...args: any[]) => Promise<any>
type OnHit<T extends Awaitable> = (data: Awaited<ReturnType<T>>) => void
type UserUpdateCacheHooked<T extends Awaitable> = (
	onHit: OnHit<T>,
	userId: number,
	...args: any[]
) => void

// Prevent repeated calls until promise resolved also caching result by first function argument
export function memoize<T extends Awaitable>(fn: T): UserUpdateCacheHooked<T> {
	const cache = new Map()
	let mutex = false

	return function (onHit, userId, ...args) {
		if (mutex) return
		mutex = true

		const key = args[0]
		if (cache.has(key)) {
			mutex = false
			return onHit(cache.get(key))
		}

		fn.apply(this, args).then((e: any) => {
			cache.set(key, e)
			notifyUserUpdated(userId)
			mutex = false
		})
	}
}

export const memoizedRegexRequest = memoize(
	async (url: string, regex: RegExp, _default = "undefined") => {
		return GM.xmlHttpRequest({
			method: "GET",
			timeout: 5000,
			url,
		})
			.then((r) => r.responseText.match(regex)?.[1] ?? _default)
			.catch(console.error)
	},
)
