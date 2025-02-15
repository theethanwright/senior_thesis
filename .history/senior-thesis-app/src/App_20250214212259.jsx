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

    const dt = e.dataTransfer
    // If there are files, let the default file handling continue
    if (dt.files?.length) {
      // ...existing file drop handling logic...
      return
    }

    // Check for HTML first, then fall back to plain text if available
    const droppedHtml = dt.getData('text/html')
    const droppedText = dt.getData(droppedHtml ? 'text/html' : 'text/plain')
    console.log('Dropped content:', droppedHtml || droppedText)
    if (!droppedText.trim()) return

    // Convert client coordinates to canvas page coordinates
    const { x, y } = editor.screenToPage({ x: e.clientX, y: e.clientY })
    console.log('Drop coordinates (canvas page):', { x, y })

    // Create a new text shape with the dropped content (modify as needed)
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
    e.stopPropagation();
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
          console.log('TLDraw editor mounted', editorInstance)
          setEditor(editorInstance)
        }}
      />
    </div>
  )
}