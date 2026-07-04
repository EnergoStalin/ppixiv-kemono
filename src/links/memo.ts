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

	return function (this: unknown, onHit, userId, ...args) {
		if (mutex) return
		mutex = true

		const key = args[0]
		if (cache.has(key)) {
			mutex = false
			const entry = cache.get(key)
			if (entry !== undefined) {
				return onHit(entry)
			}
		}

		fn.apply(this, args).then((e: any) => {
			cache.set(key, e)
			notifyUserUpdated(userId)
			mutex = false
		})
	}
}

function anyFirstMatch(text: string, regexes: RegExp[]) {
	for(const r of regexes) {
		const match = text.match(r)?.[1]
		if (match) return match
	}

	return undefined
}

export const memoizedRegexRequest = memoize(
	async (url: string, regexes: RegExp[], _default = "undefined") => {
		return GM.xmlHttpRequest({
			method: "GET",
			timeout: 5000,
			url,
		})
			.then((r) => anyFirstMatch(r.responseText, regexes) ?? _default)
			.catch(console.log)
	},
)
