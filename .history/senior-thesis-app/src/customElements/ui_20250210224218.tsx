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
			id: 'search',
			icon: 'color', // Update icon to a browser-related one if available
			label: 'Search',
			kbd: 'b',
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
		return (
			<DefaultToolbar {...props}>
				<TldrawUiMenuItem {...tools['browser']} isSelected={isBrowserSelected} />
				<DefaultToolbarContent />
			</DefaultToolbar>
		)
	},
}
