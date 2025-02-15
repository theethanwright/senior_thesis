import React, { useEffect } from 'react'
import { Tldraw, useEditor } from 'tldraw'
import { useSyncDemo } from '@tldraw/sync'
import 'tldraw/tldraw.css'
import { BrowserShapeTool, BrowserShapeUtil } from './customElements/WebBrowser'
import { SearchShapeTool, SearchShapeUtil } from './customElements/TopicDecleration'
import { components, uiOverrides } from './customElements/ui'

const customShapes = [BrowserShapeUtil, SearchShapeUtil]
const customTools = [BrowserShapeTool, SearchShapeTool]

export default function App() {
  const store = useSyncDemo({ roomId: '1-sefgr', shapeUtils: customShapes })

  const handleDragOver = (event) => {
    event.preventDefault()
    console.debug('Drag over event:', {
      clientX: event.clientX,
      clientY: event.clientY,
      dataTransferTypes: event.dataTransfer.types,
    })
  }

  const handleDragEnter = (event) => {
    console.debug('Drag enter event:', {
      clientX: event.clientX,
      clientY: event.clientY,
    })
  }

  const handleDropCapture = (event) => {
    console.debug('Drop capture fired:', {
      clientX: event.clientX,
      clientY: event.clientY,
    })
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0 }}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDropCapture={handleDropCapture}
      onDrop={handleDrop}
    >
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