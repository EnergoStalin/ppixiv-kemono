local overseer = require('overseer')

overseer.register_template({
	name = 'dev',
	builder = function()
		return {
			cmd = '',
			components = {
				'unique',
				{
					'dependencies',
					task_names = {
						'watch',
						'serve',
						{'shell', cmd = 'sleep 2 && firefox ./build/index.proxy.user.js'},
					},
					sequential = false,
				}
			},
		}
	end,
})

overseer.register_template({
	name = 'watch',
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
			components = {
				'unique',
			}
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

overseer.register_template({
	name = 'Install release',
	builder = function()
		return {
			cmd = '',
			components = {
				'unique',
				{
					'dependencies',
					task_names = {
						{'shell', cmd = 'pnpm build'},
						{'shell', cmd = 'firefox ./build/index.user.js'},
					}
				}
			}
		}
	end,
})

overseer.run_template({ name = 'dev' })
