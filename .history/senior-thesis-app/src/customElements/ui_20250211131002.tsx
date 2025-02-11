import React from 'react'
import {
	DefaultToolbar,
	DefaultToolbarContent,
	TLComponents,
	TLUiOverrides,
	TldrawUiMenuItem,
	useIsToolSelected,
	useTools,
} from 'tldraw'
import { BrowserOverlay } from './BrowserOverlay'

export const uiOverrides: TLUiOverrides = {
	tools(editor, tools) {
		// Create a tool item in the UI's context.
		tools.browser = {
			id: 'browser',
			icon: 'color', // Replace with a browser-related icon if available
			label: 'Browser',
			kbd: 'b',
			onSelect: () => {
				editor.setCurrentTool('browser')
			},
		}
		// Add the Search Shape tool.
		tools.search = {
			id: 'search',
			icon: 'search', // Replace with a search-related icon if available
			label: 'Search',
			kbd: 'f', // 'f' for find, adjust as necessary
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
		const isBrowserSelected = useIsToolSelected(tools['browser'])
		const isSearchSelected = useIsToolSelected(tools['search'])

		return (
			<>
				<DefaultToolbar {...props}>
					<TldrawUiMenuItem {...tools['browser']} isSelected={isBrowserSelected} />
					<TldrawUiMenuItem {...tools['search']} isSelected={isSearchSelected} />
					<DefaultToolbarContent />
				</DefaultToolbar>
				{/* Render the BrowserOverlay outside the canvas as part of the UI */}
				<BrowserOverlay />
			</>
		)
	},
}
