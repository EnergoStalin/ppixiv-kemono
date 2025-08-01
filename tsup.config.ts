// eslint-disable-next-line import/no-unresolved
import { userscript } from "esbuild-plugin-userscript"
import { defineConfig } from "tsup"
import pkg from "@root/package.json" assert { type: "json" }

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
		"nekohouse.su",
		"t.co",
	],
	grant: ["GM.xmlHttpRequest"],
}

// eslint-disable-next-line import/no-default-export
export default defineConfig({
	entry: ["src/index.ts"],
	format: "iife",
	target: "es6",
	bundle: true,
	outDir: "build",
	clean: false,
	outExtension: () => {
		return { js: ".user.js", dts: ".user.dts" }
	},
	esbuildPlugins: [
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
