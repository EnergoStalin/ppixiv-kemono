// eslint-disable-next-line import/no-unresolved
import { userscript } from "esbuild-plugin-userscript"
import { defineConfig } from "tsup"
import pkg from "@root/package.json" assert { type: "json" }

const dev = process.env.ENVIRONMENT === "development"

const metadata = {
	name: pkg.name,
	author: pkg.author,
	description: pkg.description,
	license: pkg.license,
	version: pkg.version,
	namespace: new URL(pkg.homepage).host.split(".").reverse().join("."),
	match: pkg.homepage,
	"run-at": "document-body",
	connect: [],
	grant: [],
}

// eslint-disable-next-line import/no-default-export
export default defineConfig({
	entry: ["src/index.ts"],
	format: "iife",
	target: "es6",
	bundle: true,
	outDir: "build",
	minify: !dev,
	clean: !dev,
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
