export function lastPostTimeFromHtml(html: string) {
	const datetime = html.match(/datetime="(.+) /)
	if (!datetime) return "Could not determine last post datetime"

	return datetime[1]
}
