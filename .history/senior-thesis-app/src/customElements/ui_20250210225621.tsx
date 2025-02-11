import {
	DefaultToolbar,
	DefaultToolbarContent,
	TLComponents,
	TLUiOverrides,
	TldrawUiMenuItem,
	useIsToolSelected,
	useTools,
} from 'tldraw'

export const uiOverrides: TLUiOverrides = {
	tools(editor, tools) {
		// Create a tool item in the ui's context.
		tools.browser = {
			id: 'browser',
			icon: 'color', // Update icon to a browser-related one if available
			label: 'Browser',
			kbd: 'b',
			onSelect: () => {
				editor.setCurrentTool('browser')
			},
		}
		// Add the Search Shape tool.
		tools.searchShape = {
			id: 'browser',
			icon: 'search', // Update icon to a search-related one if available
			label: 'Search',
			kbd: 'f', // 'f' for find, adjust as necessary
			onSelect: () => {
				editor.setCurrentTool('browser')
			},
		}
		return tools
	},
}

export const components: TLComponents = {
	Toolbar: (props) => {
		const tools = useTools()
		const isBrowserSelected = useIsToolSelected(tools['browser'])
		const isSearchSelected = useIsToolSelected(tools['browser'])
		return (
			<DefaultToolbar {...props}>
				<TldrawUiMenuItem {...tools['browser']} isSelected={isBrowserSelected} />
				<TldrawUiMenuItem {...tools['search']} isSelected={isSearchSelected} />
				<DefaultToolbarContent />
			</DefaultToolbar>
		)
	},
}
