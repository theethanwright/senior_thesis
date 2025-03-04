import React, { useEffect, useState } from 'react'
import { Tldraw } from 'tldraw'
import { useSyncDemo } from '@tldraw/sync'
import 'tldraw/tldraw.css'
import { BrowserShapeTool, BrowserShapeUtil } from './customElements/WebBrowser'
import { SearchShapeTool, SearchShapeUtil } from './customElements/TopicDecleration'
import { components, uiOverrides } from './customElements/ui'

const customShapes = [BrowserShapeUtil, SearchShapeUtil]
const customTools = [BrowserShapeTool, SearchShapeTool]

export default function App() {
  const store = useSyncDemo({ roomId: '1-sefgr', shapeUtils: customShapes })
  const [editor, setEditor] = useState(null)
  
  // Handler for dropping text onto the canvas
  const handleDrop = (e) => {
    e.preventDefault()
    if (!editor) return

    // Get the dropped text
    const droppedText = e.dataTransfer.getData('text')
    if (!droppedText.trim()) return

    // Convert client coordinates to canvas page coordinates
    const { x, y } = editor.screenToPage({ x: e.clientX, y: e.clientY })

    // Create a new text shape at the drop position.
    // Note: We're using the API to create shapes, adjust the code if your API differs.
    editor.createShapes([
      {
        id: editor.createId(),
        type: 'text',
        x,
        y,
        props: {
          text: droppedText,
          // Using default TLDraw text styling
        },
      },
    ])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0 }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Tldraw
        persistenceKey="example"
        store={store}
        shapeUtils={customShapes}
        tools={customTools}
        overrides={uiOverrides}
        components={components}
        deepLinks
        onMount={(editorInstance) => {
          setEditor(editorInstance)
        }}
      />
    </div>
  )
}