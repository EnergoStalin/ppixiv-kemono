local overseer = require('overseer')

overseer.register_template({
	name = 'dev',
	builder = function()
		return {
			cmd = 'pnpm dev',
			components = { 'unique' },
		}
	end,
})

overseer.register_template({
	name = 'serve',
	builder = function()
		return {
			cmd = 'pnpm serve',
			components = { 'unique' },
		}
	end,
})

overseer.register_template({
	name = 'release',
	builder = function(params)
		return {
			cmd = 'pnpm release ' .. params.version,
		}
	end,
	params = {
		version = {
			type = 'string',
			default = vim.json.decode(
				vim.fn.join(
					vim.fn.readfile('package.json'), '\n'
				)
			).version
		},
	},
})


local buildninstall = overseer.new_task({
	name = 'Build and install',
	components = { 'unique' },
	strategy = {
		'orchestrator',
		tasks = {
			{ 'shell', cmd = 'pnpm build' },
			{ 'shell', cmd = 'firefox ./build/index.user.js' },
		},
	}
})

overseer.run_template({ name = 'dev' })
overseer.run_template({ name = 'serve' })

overseer.new_task({ name = 'install', cmd = 'sleep 2 && firefox ./build/index.proxy.user.js' }):start()

vim.api.nvim_create_user_command('BuildAndInstall', function() buildninstall:start() end, {})
