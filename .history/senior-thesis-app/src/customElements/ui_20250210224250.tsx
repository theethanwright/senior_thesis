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
		tools.search = {
			id: 'search',
			icon: 'color', // Update icon to a search-related one if available
			label: 'Search',
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
		const issearchSelected = useIsToolSelected(tools['search'])
		return (
			<DefaultToolbar {...props}>
				<TldrawUiMenuItem {...tools['search']} isSelected={issearchSelected} />
				<DefaultToolbarContent />
			</DefaultToolbar>
		)
	},
}
