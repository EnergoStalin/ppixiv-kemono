local overseer = require('overseer')

overseer.register_template({
	name = 'release',
	params = function()
		local version = vim.json.decode(
			vim.fn.join(
				vim.fn.readfile('package.json'), '\n'
			)
		).version

		return {
			version = {
				type = 'string',
				desc = version,
			},
		}
	end,
	builder = function(p)
		return {
			cmd = 'pnpm release ' .. p.version,
			env = {
				VERSION = p.version
			}
		}
	end,
})

overseer.register_template({
	name = 'install release',
	builder = function()
		return {
			name = 'install local release',
			strategy = {
				'orchestrator',
				tasks = {
					{ 'pnpm build' },
					{ 'shell',     cmd = 'xdg-open ./build/index.user.js' },
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

overseer.register_template({
	name = 'install greasyfork',
	builder = function()
		return {
			name = 'install remote release',
			cmd = 'xdg-open https://update.greasyfork.org/scripts/475316/kemonosu%20links%20for%20ppixiv.user.js',
			components = {
				{ 'on_complete_dispose', require_view = { 'FAILURE' }, timeout = 10 },
				'default',
				'unique',
			}
		}
	end,
})

overseer.run_task({ name = 'pnpm dev (ppixiv-kemono)' })
overseer.run_task({ name = 'pnpm serve (ppixiv-kemono)' })

vim.fn.writefile({ "pnpm build", "git add index.user.js" }, ".git/hooks/pre-commit")
