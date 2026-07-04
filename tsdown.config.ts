// eslint-disable-next-line import/no-unresolved
import { userscript } from "unplugin-plugin-userscript/rolldown"
import { defineConfig } from "tsdown"
import pkg from "@root/package.json" with { type: "json" }

const dev = process.env.ENVIRONMENT === "development"

const metadata = {
	name: "kemono.su links for ppixiv",
	author: pkg.author,
	description: pkg.description,
	license: pkg.license,
	version: process.env.VERSION || pkg.version,
	namespace: "https://pixiv.net",
	match: "https://*.pixiv.net/*",
	"run-at": "document-body",
	icon: "https://www.google.com/s2/favicons?sz=64&domain=pixiv.net",
	connect: [
		"gumroad.com",
		"fanbox.cc",
		"www.patreon.com",
		"kemono.cr",
		"pawchive.pw",
		"nekohouse.su",
		"t.co",
		"twitter.com",
	],
	grant: ["GM.xmlHttpRequest"],
}

// eslint-disable-next-line import/no-default-export
export default defineConfig({
	entry: ["src/index.ts"],
	format: "esm",
	target: "es6",
	outDir: "build",
	platform: "browser",
	clean: false,
	outExtensions: () => {
		return { js: ".user.js", dts: ".user.dts" }
	},
	plugins: [
		userscript({
			metadata,
			proxy: dev
				? {
					port: 8080,
					metadata,
					targets: () => true,
				}
				: undefined,
		}),
	],
})
