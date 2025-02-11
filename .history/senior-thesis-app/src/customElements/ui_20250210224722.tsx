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
			id: 'search', // Unique id for the tool
			icon: 'color', // Update icon to a browser-related one if available
			label: 'Search', // Update label to 'Search' if available
			kbd: 'b',
			onSelect: () => {
				editor.setCurrentTool('search')
			},
		}
		return tools
	},
}

export const components: TLComponents = {
	Toolbar: (props) => {
		const tools = useTools()
		const isBrowserSelected = useIsToolSelected(tools['search'])
		return (
			<DefaultToolbar {...props}>
				<TldrawUiMenuItem {...tools['search']} isSelected={isBrowserSelected} />
				<DefaultToolbarContent />
			</DefaultToolbar>
		)
	},
}
