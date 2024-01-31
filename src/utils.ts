export function normalizeUrl(url: string) {
	let normalized = url.trim()
	if (!normalized.startsWith("http")) normalized = `https://${normalized}`

	return normalized
}
