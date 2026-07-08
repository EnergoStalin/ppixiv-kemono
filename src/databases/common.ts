export function handleLastUpdateError(lastUpdate: string | undefined) {
	if (!lastUpdate)
		throw new Error("Update")

	return lastUpdate
}

