import { notifyUserUpdated } from "./ppixiv"

/* eslint-disable @typescript-eslint/no-explicit-any */
export function normalizeUrl(url: string) {
	let normalized = url.trim()
	if (!normalized.startsWith("http")) normalized = `https://${normalized}`

	return normalized
}

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
