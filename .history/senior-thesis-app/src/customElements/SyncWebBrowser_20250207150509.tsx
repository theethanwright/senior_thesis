import { useSyncDemo } from '@tldraw/sync'
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import { BrowserShapeTool, BrowserShapeUtil } from './WebBrowser'
import { components, uiOverrides } from './ui'

const customShapes = [BrowserShapeUtil]
const customTools = [BrowserShapeTool]

export default function SyncDemoShapeExample({ roomId }: { roomId: string }) {
    const store = useSyncDemo({ roomId, shapeUtils: customShapes })
    return (
        <div className="tldraw__editor">
            <Tldraw
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