import { Tldraw } from 'tldraw'
import { useSyncDemo } from '@tldraw/sync'
import 'tldraw/tldraw.css'
import { BrowserShapeTool, BrowserShapeUtil } from './customElements/WebBrowser'
import { BrowserShapeTool, BrowserShapeUtil } from './customElements/WebBrowser'
import { components, uiOverrides } from './customElements/ui'

const customShapes = [BrowserShapeUtil]
const customTools = [BrowserShapeTool]

export default function App() {
  const store = useSyncDemo({ roomId: '1-sefgr', shapeUtils: customShapes })
	return (
		<div style={{ position: 'fixed', inset: 0 }}>
			<Tldraw 
      persistenceKey="example"
      store={store}
      shapeUtils={customShapes}
      tools={customTools}
      overrides={uiOverrides}
      components={components}
      deepLinks
      />
		</div>
	)
}