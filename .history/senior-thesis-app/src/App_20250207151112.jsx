import { Tldraw } from 'tldraw'
import { useSyncDemo } from '@tldraw/sync'
import 'tldraw/tldraw.css'
import { BrowserShapeTool, BrowserShapeUtil } from './WebBrowser'
import { components, uiOverrides } from './ui'

export default function App() {
  const store = useSyncDemo({ roomId: '1-sefgr' })
	return (
		<div style={{ position: 'fixed', inset: 0 }}>
			<Tldraw 
      persistenceKey="example"
      store={store}
      />
		</div>
	)
}