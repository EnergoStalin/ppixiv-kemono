local overseer = require('overseer')

overseer.register_template({
	name = 'dev',
	builder = function()
		return {
			name = 'Development',
			strategy = {
				'orchestrator',
				tasks = {
					'pnpm dev',
					'pnpm serve',
					{ 'shell', cmd = 'sleep 2 && firefox ./build/index.proxy.user.js' },
				}
			},
			components = {
				'default',
				'unique',
			},
		}
	end,
})

overseer.register_template({
	name = 'release',
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
	builder = function(p)
		return {
			cmd = 'pnpm release ' .. p.version,
		}
	end,
})

overseer.register_template({
	name = 'Install release',
	builder = function()
		return {
			name = 'Install local release',
			strategy = {
				'orchestrator',
				tasks = {
					{ 'pnpm build' },
					{ 'shell', cmd = 'firefox ./build/index.user.js' },
				}
			},
			components = {
				{ 'on_complete_dispose', require_view = { 'FAILURE' }, timeout = 10 },
				'on_exit_set_status',
				'unique',
			}
		}
	end,
})

overseer.run_template({ name = 'dev' })
