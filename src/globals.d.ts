declare interface UserLink {
	url: string | URL
	label: string
	type?: string
	icon?: string
	disabled?: boolean
}

declare interface User {
	userId: number
}

declare interface Window {
	ppixiv: {
		userCache: {
			callUserModifiedCallbacks: (id: number) => void
		}
	}
	vviewHooks: {
		addUserLinks: (args: { extraLinks: UserLink[]; userInfo: User }) => void
	}
}
