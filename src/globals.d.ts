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
		},
		mediaCache: {
			_mediaInfo: Map<string, {
				userId: string
			}>
		},
		app: {
			_screenIllust: {
				currentMediaId: string
			}
		}
	}
	vviewHooks: {
		addUserLinks?: (args: { extraLinks: UserLink[]; userInfo: User }) => void
		dropdownMenuOptions?: ({ moreOptionsDropdown: any, sharedOptions: any }) => void
	}
}
