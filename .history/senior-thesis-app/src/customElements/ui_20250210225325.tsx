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
			id: 'search',
			icon: 'search', // Update icon to a search-related one if available
			label: 'Search Shape',
			kbd: 'f', // 'f' for find, adjust as necessary
			onSelect: () => {
				editor.setCurrentTool('searchShape')
			},
		}
		return tools
	},
}

function Toolbar(props: any) {
	const tools = useTools()
	const isBrowserSelected = useIsToolSelected(tools['browser'])
	const isSearchShapeSelected = useIsToolSelected(tools['searchShape'])
	return (
		<DefaultToolbar {...props}>
			<TldrawUiMenuItem {...tools['browser']} isSelected={isBrowserSelected} />
			<TldrawUiMenuItem {...tools['searchShape']} isSelected={isSearchShapeSelected} />
			<DefaultToolbarContent />
		</DefaultToolbar>
	)
}

Toolbar.displayName = 'Toolbar'

export const components: TLComponents = {
	Toolbar,
}
